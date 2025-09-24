import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { chainIdToExplorerInfoChainName } from 'state/info/api/client'
import { useCallback } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { SLOW_INTERVAL } from 'config/constants'
import { PCS_LIMIT_ORDER_HISTORY_URL, ORDERS_PER_PAGE } from '../constants'
import { OrderHistoryResponse, PaginationParams, OrderStatus } from '../types/orders.types'
import {
  currentCursorAtom,
  cursorsAtom,
  paginationDirectionAtom,
  currentPageAtom,
  filterOrderStatusAtom,
  canGoBackAtom,
  resetPaginationAtom,
  toggleOpenFilterAtom,
} from '../state/pagination/paginationAtoms'

async function getUserLimitOrders(
  chainName: string,
  address: string,
  orderStatus?: OrderStatus,
  pagination?: PaginationParams,
) {
  const url = new URL(`${PCS_LIMIT_ORDER_HISTORY_URL}/${chainName}/${address}${orderStatus ? `/${orderStatus}` : ''}`)

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
  const { account, chainId } = useAccountActiveChain()
  const chainName = chainIdToExplorerInfoChainName[chainId]

  // Use atoms for shared state
  const filterOrderStatus = useAtomValue(filterOrderStatusAtom)
  const [currentCursor, setCurrentCursor] = useAtom(currentCursorAtom)
  const [cursors, setCursors] = useAtom(cursorsAtom)
  const [paginationDirection, setPaginationDirection] = useAtom(paginationDirectionAtom)
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom)
  const canGoBack = useAtomValue(canGoBackAtom)
  const resetPagination = useSetAtom(resetPaginationAtom)
  const toggleOpenFilter = useSetAtom(toggleOpenFilterAtom)

  const queryResult = useQuery({
    queryKey: ['userLimitOrders', chainId, account, filterOrderStatus, currentCursor, paginationDirection],
    queryFn: async () => {
      if (!account) return { orders: [], paginationInfo: null }

      const paginationParams: PaginationParams = {}
      if (currentCursor && paginationDirection === 'forward') {
        paginationParams.after = currentCursor
      } else if (currentCursor && paginationDirection === 'backward') {
        paginationParams.before = currentCursor
      }

      const data = await getUserLimitOrders(chainName, account, filterOrderStatus, paginationParams)
      const { rows } = data

      console.log('%c [Order History Data]', 'background: green;color: white', rows)

      return {
        orders: rows,
        paginationInfo: {
          startCursor: data.startCursor,
          endCursor: data.endCursor,
          hasNextPage: data.hasNextPage,
        },
      }
    },
    enabled: !!account && !!chainName,
    refetchInterval: SLOW_INTERVAL,
    staleTime: 100, // 100ms
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
      setCurrentPage((prev) => prev + 1)
    }
  }, [
    queryResult.data?.paginationInfo,
    currentCursor,
    setCursors,
    setCurrentCursor,
    setPaginationDirection,
    setCurrentPage,
  ])

  const previousPage = useCallback(() => {
    if (cursors.length > 0) {
      const previousCursor = cursors[cursors.length - 1]
      setCursors((prev) => prev.slice(0, -1))
      setCurrentCursor(previousCursor)
      setPaginationDirection('backward')
      setCurrentPage((prev) => prev - 1)
    } else {
      // Go to first page
      setCurrentCursor(null)
      setPaginationDirection(null)
      setCurrentPage(1)
    }
  }, [cursors, setCursors, setCurrentCursor, setPaginationDirection, setCurrentPage])

  const canGoForward = queryResult.data?.paginationInfo?.hasNextPage ?? false

  const orders = queryResult.data?.orders || []

  return {
    ...queryResult,
    data: orders,
    paginationInfo: queryResult.data?.paginationInfo || null,
    filterOrderStatus,
    nextPage,
    previousPage,
    resetPagination,
    toggleOpenFilter,
    canGoBack,
    canGoForward,
    currentPage,
    ordersPerPage: ORDERS_PER_PAGE,
  }
}
