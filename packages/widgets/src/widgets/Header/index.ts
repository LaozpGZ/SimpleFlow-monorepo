import { AnnouncementBanner, LocaleSelector, Navigation } from '@pancakeswap/uikit'
import { PancakeSwapHeader } from './PancakeSwapHeader'

PancakeSwapHeader.displayName = 'PancakeSwapHeader'

export type PancakeSwapHeaderComponentType = typeof PancakeSwapHeader & {
  AnnouncementBanner: typeof AnnouncementBanner
  LocaleSelector: typeof LocaleSelector
  Navigation: typeof Navigation
}
;(PancakeSwapHeader as PancakeSwapHeaderComponentType).AnnouncementBanner = AnnouncementBanner
;(PancakeSwapHeader as PancakeSwapHeaderComponentType).LocaleSelector = LocaleSelector
;(PancakeSwapHeader as PancakeSwapHeaderComponentType).Navigation = Navigation

export { PancakeSwapHeader }
