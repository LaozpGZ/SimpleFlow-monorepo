import { AnnouncementBanner, LocaleSelector } from '@pancakeswap/uikit'
import { PancakeSwapHeader } from './PancakeSwapHeader'
import { PancakeSwapNavigation } from './components/PancakeSwapNavigation'

PancakeSwapHeader.displayName = 'PancakeSwapHeader'

export type PancakeSwapHeaderComponentType = typeof PancakeSwapHeader & {
  AnnouncementBanner: typeof AnnouncementBanner
  LocaleSelector: typeof LocaleSelector
  Navigation: typeof PancakeSwapNavigation
}
;(PancakeSwapHeader as PancakeSwapHeaderComponentType).AnnouncementBanner = AnnouncementBanner
;(PancakeSwapHeader as PancakeSwapHeaderComponentType).LocaleSelector = LocaleSelector
;(PancakeSwapHeader as PancakeSwapHeaderComponentType).Navigation = PancakeSwapNavigation

export type { AnnouncementBannerProps, LocaleSelectorProps, NavigationProps } from '@pancakeswap/uikit'
export type { PancakeSwapHeaderProps } from './PancakeSwapHeader'

export default PancakeSwapHeader as PancakeSwapHeaderComponentType
