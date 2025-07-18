import { Navigation } from '@pancakeswap/uikit'
import { NavigationDropdownItem } from './config/getConfig'
import { useActiveNavigationItems } from './hooks/useActiveNavigationItems'
import { useNavigationItems } from './hooks/useNavigationItems'
import { getItemsLinks } from './utils/getItemsLinks'

export type PancakeSwapNavigationProps = {
  chainId?: number
  onNavigationItemClick?: (e: React.MouseEvent<HTMLElement>, item?: NavigationDropdownItem) => void
}

export const PancakeSwapNavigation: React.FC<PancakeSwapNavigationProps> = ({ chainId, onNavigationItemClick }) => {
  const navigationItems = useNavigationItems({ chainId, onClick: onNavigationItemClick })
  const { activeItem, activeSubItem, activeSubChildMenuItem } = useActiveNavigationItems(
    navigationItems,
    typeof window !== 'undefined' ? window.location.pathname : '',
  )

  return (
    <Navigation
      links={getItemsLinks(navigationItems)}
      activeItem={activeItem?.href}
      activeSubItem={activeSubItem?.href}
      activeSubItemChildItem={activeSubChildMenuItem?.href}
    />
  )
}
