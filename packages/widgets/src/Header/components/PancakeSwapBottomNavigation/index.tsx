import { AtomBox, BottomNav } from '@pancakeswap/uikit'
import { NavigationDropdownItem } from '../PancakeSwapNavigation/config/getConfig'
import { useActiveNavigationItems } from '../PancakeSwapNavigation/hooks/useActiveNavigationItems'
import { useNavigationItems } from '../PancakeSwapNavigation/hooks/useNavigationItems'
import { getItemsLinks } from '../PancakeSwapNavigation/utils/getItemsLinks'

export type PancakeSwapBottomNavigationProps = {
  chainId?: number
  onNavigationItemClick?: (e: React.MouseEvent<HTMLElement>, item?: NavigationDropdownItem) => void
}

export const PancakeSwapBottomNavigation: React.FC<PancakeSwapBottomNavigationProps> = ({
  chainId,
  onNavigationItemClick,
}) => {
  const navigationItems = useNavigationItems({ chainId, onClick: onNavigationItemClick })
  const { activeItem, activeSubItem } = useActiveNavigationItems(
    navigationItems,
    typeof window !== 'undefined' ? window.location.pathname : '',
  )

  return (
    <AtomBox display={{ xs: 'block', lg: 'none' }}>
      <BottomNav
        items={getItemsLinks(navigationItems)}
        activeItem={activeItem?.href}
        activeSubItem={activeSubItem?.href}
      />
    </AtomBox>
  )
}
