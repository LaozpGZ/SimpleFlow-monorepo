import { AdSlide, Priority } from '@pancakeswap/widgets-internal'
import { AdPCSX } from './ads/AdPCSX'

export const adList: Array<AdSlide> = [
  {
    id: 'expandable-ad',
    component: <AdPCSX />,
    priority: Priority.FIRST_AD,
  },
]

export const commonLayoutWhitelistedPages = ['/swap']
