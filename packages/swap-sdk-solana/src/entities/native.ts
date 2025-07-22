import { SPLNativeCurrency, SPLToken } from '@pancakeswap/swap-sdk-core'
import { SOL_INFO, WSOL } from '../constants'

/**
 *
 * Native is the main usage of a 'native' currency
 */
export class SPLNative extends SPLNativeCurrency {
  constructor({
    chainId,
    decimals,
    name,
    symbol,
  }: {
    chainId: number
    decimals: number
    symbol: string
    name: string
  }) {
    super(chainId, decimals, symbol, name)
  }

  // eslint-disable-next-line class-methods-use-this
  public get wrapped(): SPLToken {
    return WSOL
  }

  public equals(other: SPLToken | SPLNativeCurrency): boolean {
    return other.isNative && other.chainId === this.chainId
  }
}

export const SOL = new SPLNative(SOL_INFO)
