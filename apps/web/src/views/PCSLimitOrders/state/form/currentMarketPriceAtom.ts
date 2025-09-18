import { atom } from 'jotai'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { BigNumber as BN } from 'bignumber.js'
import { ticksAtom } from './ticksAtom'

// Current market price derived from ticks data
export const currentMarketPriceAtom = atom(async (get) => {
  const ticksData = await get(ticksAtom)
  if (!ticksData) return undefined

  return formatNumber(BN(ticksData.currentMarketPrice || '0'), {
    maxDecimalDisplayDigits: 6,
    maximumSignificantDigits: 6,
  })
})
