import { BIG_TEN } from '@simpleflow/utils/bigNumber'
import memoize from '@simpleflow/utils/memoize'
import BN from 'bignumber.js'

export const getFullDecimalMultiplier = memoize((decimals: number): BN => {
  return BIG_TEN.pow(decimals)
})
