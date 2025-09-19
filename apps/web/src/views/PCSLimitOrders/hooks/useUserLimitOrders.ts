import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { chainIdToExplorerInfoChainName } from 'state/info/api/client'
import { useCLLimitOrderHookContract } from 'hooks/useContract'
import { useState, useCallback } from 'react'
import { PCS_LIMIT_ORDER_HISTORY_URL } from '../constants'
import { OrderStatus, OrderHistoryResponse, PaginationParams, PaginationInfo } from '../types/orders.types'

async function getUserLimitOrders(chainName: string, address: string, pagination?: PaginationParams) {
  const url = new URL(`${PCS_LIMIT_ORDER_HISTORY_URL}/${chainName}/${address}`)

  if (pagination?.before) {
    url.searchParams.set('before', pagination.before)
  }
  if (pagination?.after) {
    url.searchParams.set('after', pagination.after)
  }

  const response = await fetch(url.toString())
  if (!response.ok) {
    console.error('Failed to fetch user limit orders', response)
    return {
      startCursor: '',
      endCursor: '',
      hasNextPage: false,
      rows: [],
    }
  }
  return (await response.json()) as OrderHistoryResponse
}

export const useUserLimitOrders = () => {
  const contract = useCLLimitOrderHookContract()

  const { account, chainId } = useAccountActiveChain()
  const chainName = chainIdToExplorerInfoChainName[chainId]

  // Cursor-based pagination state
  const [currentCursor, setCurrentCursor] = useState<string | null>(null)
  const [cursors, setCursors] = useState<string[]>([]) // Stack of cursors for backward navigation
  const [paginationDirection, setPaginationDirection] = useState<'forward' | 'backward' | null>(null)

  const queryResult = useQuery({
    queryKey: ['userLimitOrders', chainId, account, currentCursor, paginationDirection],
    queryFn: async () => {
      if (!account) return { orders: [], paginationInfo: null }

      const paginationParams: PaginationParams = {}
      if (currentCursor && paginationDirection === 'forward') {
        paginationParams.after = currentCursor
      } else if (currentCursor && paginationDirection === 'backward') {
        paginationParams.before = currentCursor
      }

      const data = await getUserLimitOrders(chainName, account, paginationParams)
      const { rows } = data

      console.log('%c [Order History Data]', 'background: green;color: white', rows)

      const orders = await Promise.allSettled(
        rows.map(async (item) => {
          // Fetch Amounts //
          let amount0: bigint | undefined
          let amount1: bigint | undefined

          // If order status is OPEN, simulate Cancel
          if (item.status === OrderStatus.Open) {
            const { result } = await contract.simulate.cancelOrder([BigInt(item.order_id), account])
            amount0 = result[0]
            amount1 = result[1]
          }
          // If order status is Filled, simulate Withdraw
          if (item.status === OrderStatus.Filled) {
            const { result } = await contract.simulate.withdraw([BigInt(item.order_id), account])
            amount0 = result[0]
            amount1 = result[1]
          }

          // But how to fetch amounts if order is cancelled or withdrawn 🤔

          return {
            amount0,
            amount1,
            ...item,
          }
        }),
      )

      console.log('%c [Orders]', 'background: darkgreen;color: white', orders)

      const processedOrders = orders.filter((order) => order.status === 'fulfilled').map((order) => order.value)

      return {
        orders: processedOrders,
        paginationInfo: {
          startCursor: data.startCursor,
          endCursor: data.endCursor,
          hasNextPage: data.hasNextPage,
        },
      }
    },
    enabled: !!account && !!chainName,
  })

  // Navigation methods
  const nextPage = useCallback(() => {
    const paginationInfo = queryResult.data?.paginationInfo
    if (paginationInfo?.hasNextPage && paginationInfo.endCursor) {
      // Save current cursor for backward navigation
      if (currentCursor) {
        setCursors((prev) => [...prev, currentCursor])
      }
      setCurrentCursor(paginationInfo.endCursor)
      setPaginationDirection('forward')
    }
  }, [queryResult.data?.paginationInfo, currentCursor])

  const previousPage = useCallback(() => {
    if (cursors.length > 0) {
      const previousCursor = cursors[cursors.length - 1]
      setCursors((prev) => prev.slice(0, -1))
      setCurrentCursor(previousCursor)
      setPaginationDirection('backward')
    } else {
      // Go to first page
      setCurrentCursor(null)
      setPaginationDirection(null)
    }
  }, [cursors])

  const resetPagination = useCallback(() => {
    setCurrentCursor(null)
    setCursors([])
    setPaginationDirection(null)
  }, [])

  const canGoBack = cursors.length > 0 || currentCursor !== null
  const canGoForward = queryResult.data?.paginationInfo?.hasNextPage ?? false

  return {
    ...queryResult,
    data: queryResult.data?.orders || [],
    paginationInfo: queryResult.data?.paginationInfo || null,
    nextPage,
    previousPage,
    resetPagination,
    canGoBack,
    canGoForward,
  }
}
