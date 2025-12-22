import { useTranslation } from '@pancakeswap/localization'
import { DropdownMenuItemType, Menu as UikitMenu, footerLinks } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useTheme from 'hooks/useTheme'
import { useWebNotifications } from 'hooks/useWebNotifications'
import { useRouter } from 'next/router'
import { Suspense, lazy, useMemo } from 'react'
import { styled } from 'styled-components'
import GlobalSettings from './GlobalSettings'
import UserMenu from './UserMenu'
import { useMenuItems } from './hooks/useMenuItems'
import { getActiveMenuItem, getActiveSubMenuChildItem, getActiveSubMenuItem } from './utils'

const Notifications = lazy(() => import('views/Notifications'))

const LinkComponent = (linkProps) => {
  const { href, type, ...props } = linkProps
  // Check if it's an external link by type property first, then fallback to URL pattern
  const isExternalLink =
    type === DropdownMenuItemType.EXTERNAL_LINK || href?.startsWith('http://') || href?.startsWith('https://')

  if (isExternalLink) {
    return <NextLinkFromReactRouter to={href} target="_blank" rel="noreferrer noopener" {...props} />
  }

  return <NextLinkFromReactRouter to={href} {...props} prefetch={false} />
}

const EMPTY_ARRAY = []

const Menu = (props) => {
  const { enabled } = useWebNotifications()
  const { chainId } = useActiveChainId()
  const { isDark, setTheme } = useTheme()
  const { t } = useTranslation()
  const { pathname } = useRouter()

  const menuItems = useMenuItems({})

  const activeMenuItem = useMemo(() => getActiveMenuItem({ menuConfig: menuItems, pathname }), [menuItems, pathname])
  const activeSubMenuItem = useMemo(
    () => getActiveSubMenuItem({ menuItem: activeMenuItem, pathname }),
    [pathname, activeMenuItem],
  )
  const activeSubChildMenuItem = useMemo(
    () => getActiveSubMenuChildItem({ menuItem: activeMenuItem, pathname }),
    [activeMenuItem, pathname],
  )

  const toggleTheme = useMemo(() => {
    return () => setTheme(isDark ? 'light' : 'dark')
  }, [setTheme, isDark])

  const getFooterLinks = useMemo(() => {
    return footerLinks(t)
  }, [t])

  const filteredLinks = useMemo(() => filterItemsProps(menuItems), [menuItems])

  return (
    <UikitMenu
      linkComponent={LinkComponent}
      rightSide={
        <>
          <GlobalSettings />
          {enabled && (
            <Suspense fallback={null}>
              <Notifications />
            </Suspense>
          )}
          <NetworkSwitcher />
          <UserMenu />
        </>
      }
      chainId={chainId}
      banner={null}
      logoComponent={<></>}
      isDark={isDark}
      toggleTheme={toggleTheme}
      showLangSelector={false}
      showCakePrice={false}
      links={filteredLinks}
      subLinks={
        activeSubMenuItem?.overrideSubNavItems ??
        activeMenuItem?.overrideSubNavItems ??
        (activeMenuItem?.hideSubNav || activeSubMenuItem?.hideSubNav
          ? EMPTY_ARRAY
          : activeSubMenuItem?.items ?? activeMenuItem?.items)
      }
      footerLinks={getFooterLinks}
      activeItem={activeMenuItem?.href}
      activeSubItem={activeSubMenuItem?.href}
      activeSubItemChildItem={activeSubChildMenuItem?.href}
      buyCakeLabel={t('Buy CAKE')}
      buyCakeLink="/swap?outputCurrency=0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82&chainId=56"
      {...props}
    />
  )
}

function filterItemsProps(items: ReturnType<typeof useMenuItems>) {
  return items.map((item) => {
    return {
      ...item,
      items: item.items?.map((subItem) => {
        const { matchHrefs, overrideSubNavItems, ...rest } = subItem
        return rest
      }),
    }
  })
}

export default Menu

const SharedComponentWithOutMenuWrapper = styled.div`
  display: none;
`

export const SharedComponentWithOutMenu: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { enabled } = useWebNotifications()
  return (
    <>
      <SharedComponentWithOutMenuWrapper>
        <GlobalSettings />
        {enabled && (
          <Suspense fallback={null}>
            <Notifications />
          </Suspense>
        )}
        <NetworkSwitcher />
        <UserMenu />
      </SharedComponentWithOutMenuWrapper>
      {children}
    </>
  )
}
