import { Token } from '@simpleflow/sdk'
import { ChainId } from '@simpleflow/chains'

// a list of tokens by chain
export type ChainMap<T> = {
  readonly [chainId in ChainId]: T
}

export type ChainTokenList = ChainMap<Token[]>
