import { formatFiatNumber } from '@pancakeswap/utils/formatFiatNumber'
import { BigNumber as BN } from 'bignumber.js'

export const formatPoolDetailFiatNumber = (value: string | number | BN) => {
  return formatFiatNumber(value, '$').replace(' ', '')
}
