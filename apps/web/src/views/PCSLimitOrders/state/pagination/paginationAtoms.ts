import { atom } from 'jotai'
import { OrderStatus } from '../../types/orders.types'

// Cursor-based pagination state
export const currentCursorAtom = atom<string | null>(null)
export const cursorsAtom = atom<string[]>([]) // Stack of cursors for backward navigation
export const paginationDirectionAtom = atom<'forward' | 'backward' | null>(null)

// Page number tracking
export const currentPageAtom = atom<number>(1)

// Order status filter state
export const filterOrderStatusAtom = atom<OrderStatus | undefined>(undefined)

// Derived atoms for navigation
export const canGoBackAtom = atom((get) => {
  const cursors = get(cursorsAtom)
  const currentCursor = get(currentCursorAtom)
  return cursors.length > 0 || currentCursor !== null
})

// Reset pagination action atom
export const resetPaginationAtom = atom(null, (get, set) => {
  set(currentCursorAtom, null)
  set(cursorsAtom, [])
  set(paginationDirectionAtom, null)
  set(currentPageAtom, 1)
})

// Toggle open filter action atom
export const toggleOpenFilterAtom = atom(null, (get, set) => {
  const current = get(filterOrderStatusAtom)
  set(filterOrderStatusAtom, current === OrderStatus.Open ? undefined : OrderStatus.Open)
  // Reset pagination when filter changes
  set(resetPaginationAtom)
})
