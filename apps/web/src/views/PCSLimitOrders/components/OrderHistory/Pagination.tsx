import { PaginationButton } from '@pancakeswap/uikit'
import { useCallback } from 'react'
import { useUserLimitOrders } from 'views/PCSLimitOrders/hooks/useUserLimitOrders'

export const Pagination = () => {
  const { canGoBack, canGoForward, nextPage, previousPage, currentPage, isLoading } = useUserLimitOrders()

  const setCurrentPage = useCallback(
    (page: number) => {
      if (isLoading) return
      if (page > currentPage && canGoForward) {
        nextPage()
      } else if (page < currentPage && canGoBack) {
        previousPage()
      }
    },
    [currentPage, canGoBack, canGoForward, nextPage, previousPage, isLoading],
  )

  return (
    <PaginationButton
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      maxPage={!canGoForward ? currentPage : undefined}
    />
  )
}
