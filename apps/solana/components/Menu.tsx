import { DropdownMenuItems, FlexGap, MenuItemsType, ThemeSwitcher, Menu as UIMenu } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { useActiveChainId } from 'hooks/useNetwork'
import orderBy from 'lodash/orderBy'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { NetworkSwitcher } from './NetworkSwitcher'

export type ConfigMenuDropDownItemsType = DropdownMenuItems & { hideSubNav?: boolean }
export type ConfigMenuItemsType = Omit<MenuItemsType, 'items'> & { hideSubNav?: boolean; image?: string } & {
  items?: ConfigMenuDropDownItemsType[]
}

export const getActiveMenuItem = ({ pathname, menuConfig }: { pathname: string; menuConfig: ConfigMenuItemsType[] }) =>
  menuConfig.find((menuItem) => pathname.startsWith(menuItem.href) || getActiveSubMenuItem({ menuItem, pathname }))

export const getActiveSubMenuItem = ({ pathname, menuItem }: { pathname: string; menuItem?: ConfigMenuItemsType }) => {
  const activeSubMenuItems =
    menuItem?.items?.filter((subMenuItem) => subMenuItem.href && pathname.startsWith(subMenuItem.href)) ?? []

  // Pathname doesn't include any submenu item href - return undefined
  if (!activeSubMenuItems || activeSubMenuItems.length === 0) {
    return undefined
  }

  // Pathname includes one sub menu item href - return it
  if (activeSubMenuItems.length === 1) {
    return activeSubMenuItems[0]
  }

  // Pathname includes multiple sub menu item hrefs - find the most specific match
  const mostSpecificMatch = orderBy(activeSubMenuItems, (subMenuItem) => subMenuItem?.href?.length, 'desc')[0]

  return mostSpecificMatch
}

const LinkComponent = (linkProps) => {
  return <NextLinkFromReactRouter to={linkProps.href} {...linkProps} prefetch={false} />
}

const languageList = []

export const Menu = (props) => {
  const menuItems = useMemo(() => [], [])
  const { pathname } = useRouter()
  const activeMenuItem = getActiveMenuItem({ menuConfig: menuItems, pathname })
  const activeSubMenuItem = getActiveSubMenuItem({ menuItem: activeMenuItem, pathname })
  const { setTheme, resolvedTheme } = useTheme()
  const chainId = useActiveChainId()
  const isDark = resolvedTheme === 'dark'

  const toggleTheme = useMemo(() => {
    return () => setTheme(isDark ? 'light' : 'dark')
  }, [setTheme, isDark])

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <>
      {isClient ? (
        <UIMenu
          linkComponent={LinkComponent}
          chainId={chainId}
          links={menuItems}
          activeItem={activeMenuItem?.href}
          isDark={isDark}
          rightSide={
            <FlexGap gap="8px">
              <ThemeSwitcher isDark={isDark} toggleTheme={() => setTheme(isDark ? 'light' : 'dark')} />
              <NetworkSwitcher />
            </FlexGap>
          }
          showLangSelector={false}
          langs={languageList}
          activeSubItem={activeSubMenuItem?.href}
          toggleTheme={toggleTheme}
          {...props}
        />
      ) : undefined}
    </>
  )
}
