import { useMemo } from 'react'
import { NavigationItem } from '../config/getConfig'
import {
  getActiveNavigationItem,
  getActiveSubNavigationChildItem,
  getActiveSubNavigationItem,
} from '../utils/getActiveItem'

export const useActiveNavigationItems = (config: NavigationItem[], pathname: string) => {
  const activeItem = useMemo(() => getActiveNavigationItem({ config, pathname }), [config, pathname])
  const activeSubItem = useMemo(
    () => getActiveSubNavigationItem({ item: activeItem, pathname }),
    [pathname, activeItem],
  )
  const activeSubChildMenuItem = useMemo(
    () => getActiveSubNavigationChildItem({ item: activeSubItem as NavigationItem, pathname }),
    [activeSubItem, pathname],
  )

  return {
    activeItem,
    activeSubItem,
    activeSubChildMenuItem,
  }
}
