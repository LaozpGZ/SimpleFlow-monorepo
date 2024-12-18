import { Token } from '@pancakeswap/swap-sdk-core'

export class Jetton extends Token {
  public constructor(
    chainId: number,
    address: string,
    decimals: number,
    symbol: string,
    name?: string,
    projectLink?: string,
  ) {
    super(chainId, address as `0x${string}`, decimals, symbol, name, projectLink)
  }

  public sortsBefore(other: Jetton): boolean {
    return super.sortsBefore(other)
  }

  public equals(other: Jetton): boolean {
    return this.chainId === other.chainId && this.address === other.address
  }
}
