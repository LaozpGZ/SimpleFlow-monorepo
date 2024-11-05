import { BigintIsh, ChainId, Currency } from '@pancakeswap/sdk'
import { getStableSwapPools } from '@pancakeswap/stable-swap-sdk'
import { getPairCombinations } from '../../functions'
import { OnChainProvider } from '../../types'
import { getStablePoolsOnChain } from './onChainPoolProviders'

interface Params {
  currencyA?: Currency
  currencyB?: Currency
  onChainProvider?: OnChainProvider
  blockNumber?: BigintIsh

  // Only use this param if we want to specify pairs we want to get
  pairs?: [Currency, Currency][]
}

export async function getStableCandidatePools(params: Params) {
  const { onChainProvider, currencyA, currencyB, pairs: providedPairs, blockNumber } = params
  const pairs = providedPairs || (await getPairCombinations(currencyA, currencyB))
  const poolConfigs = await getStableSwapPools(currencyA?.chainId ?? ChainId.BSC)

  return getStablePoolsOnChain(pairs, onChainProvider, blockNumber, poolConfigs)
}
