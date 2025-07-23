import orderBy from 'lodash/orderBy'
import { NavigationDropdownItem, NavigationItem } from '../config/getConfig'

export const getActiveNavigationItem = ({ pathname, config }: { pathname: string; config: NavigationItem[] }) =>
  config
    .filter((item) => item.href)
    .find((item) => {
      return (
        (pathname.startsWith(item.href!) && item.href !== '/') ||
        item.href === pathname ||
        getActiveSubNavigationItem({ item, pathname }) ||
        getActiveSubNavigationChildItem({ item, pathname })
      )
    })

export const getActiveSubNavigationItem = ({
  pathname,
  item,
}: {
  pathname: string
  item?: NavigationItem
}): NavigationItem | NavigationDropdownItem | undefined => {
  const activeSubNavigationItems =
    item?.items?.filter((subItem) => {
      if (
        (subItem?.href && pathname.startsWith(subItem?.href) && subItem?.href !== '/') ||
        pathname === subItem?.href
      ) {
        return true
      }
      if (subItem?.matchHrefs?.some((matchHref) => pathname.startsWith(matchHref))) {
        return true
      }
      return false
    }) ?? []

  // Pathname doesn't include any submenu item href - return undefined
  if (!activeSubNavigationItems || activeSubNavigationItems.length === 0) {
    return undefined
  }

  // Pathname includes one sub menu item href - return it
  if (activeSubNavigationItems.length === 1) {
    return activeSubNavigationItems[0]
  }

  // Pathname includes multiple sub menu item hrefs - find the most specific match
  const mostSpecificMatch = orderBy(
    activeSubNavigationItems,
    (subItem: NavigationItem) => subItem?.href?.length,
    'desc',
  )[0] as NavigationDropdownItem

  return mostSpecificMatch
}

export const getActiveSubNavigationChildItem = ({
  pathname,
  item,
}: {
  pathname: string
  item?: NavigationItem | undefined
}) => {
  const getChildItems = item?.items
    ?.map((i) => [
      ...('items' in i ? i.items ?? [] : []),
      ...('overrideSubNavItems' in i ? i.overrideSubNavItems ?? [] : []),
    ])
    ?.filter(Boolean)
    .flat()

  const activeSubNavigationItems =
    getChildItems?.filter((subItem) => subItem?.href && pathname.startsWith(subItem?.href)) ?? []

  // Pathname doesn't include any submenu item href - return undefined
  if (!activeSubNavigationItems || activeSubNavigationItems.length === 0) {
    return undefined
  }

  // Pathname includes one sub menu item href - return it
  if (activeSubNavigationItems.length === 1) {
    return activeSubNavigationItems[0]
  }

  // Pathname includes multiple sub menu item hrefs - find the most specific match
  const mostSpecificMatch = orderBy(
    activeSubNavigationItems,
    (subItem: NavigationItem) => subItem?.href?.length,
    'desc',
  )[0]

  return mostSpecificMatch as Required<NavigationDropdownItem>['items'][number] | undefined
}
