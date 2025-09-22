import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { chainIdToExplorerInfoChainName } from 'state/info/api/client'
import { useState, useCallback } from 'react'
import { useCLLimitOrderHookContract } from 'hooks/useContract'
import { PCS_LIMIT_ORDER_HISTORY_URL } from '../constants'
import { OrderHistoryResponse, OrderStatus, PaginationParams } from '../types/orders.types'
import { fetchOrderDataById, parseOrders } from '../utils/orders'

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

      const orders = await Promise.all(
        rows.map((row) => {
          const data = fetchOrderDataById({
            account,
            contract,
            orderId: row.order_id,
            isWithdrawn: row.status === OrderStatus.Withdrawn,
          })
          return {
            ...data,
            ...row,
          }
        }),
      )

      console.log('%c [Order History Data]', 'background: green;color: white', orders)

      return {
        orders: parseOrders(orders),
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
