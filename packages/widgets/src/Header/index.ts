import { AnnouncementBanner, CakePriceWidget, LocaleSelector } from '@pancakeswap/uikit'
import { PancakeSwapBottomNavigation } from './components/PancakeSwapBottomNavigation'
import { PancakeSwapNavigation } from './components/PancakeSwapNavigation'
import { PancakeSwapHeader } from './PancakeSwapHeader'

PancakeSwapHeader.displayName = 'PancakeSwapHeader'

export type PancakeSwapHeaderComponentType = typeof PancakeSwapHeader & {
  AnnouncementBanner: typeof AnnouncementBanner
  LocaleSelector: typeof LocaleSelector
  Navigation: typeof PancakeSwapNavigation
  BottomNavigation: typeof PancakeSwapBottomNavigation
  CakePriceWidget: typeof CakePriceWidget
}
;(PancakeSwapHeader as PancakeSwapHeaderComponentType).AnnouncementBanner = AnnouncementBanner
;(PancakeSwapHeader as PancakeSwapHeaderComponentType).LocaleSelector = LocaleSelector
;(PancakeSwapHeader as PancakeSwapHeaderComponentType).Navigation = PancakeSwapNavigation
;(PancakeSwapHeader as PancakeSwapHeaderComponentType).BottomNavigation = PancakeSwapBottomNavigation
;(PancakeSwapHeader as PancakeSwapHeaderComponentType).CakePriceWidget = CakePriceWidget

export type { AnnouncementBannerProps, LocaleSelectorProps, NavigationProps } from '@pancakeswap/uikit'
export type { PancakeSwapHeaderProps } from './PancakeSwapHeader'

export default PancakeSwapHeader as PancakeSwapHeaderComponentType
