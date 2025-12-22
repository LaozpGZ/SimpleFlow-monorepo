import { ChainId, UnifiedChainId } from './chainId'

export const chainNames: Record<ChainId, string> = {
  [ChainId.BSC]: 'bsc',
  [ChainId.BSC_TESTNET]: 'bscTestnet',
  [ChainId.SIMPLECHAIN_TESTNET]: 'simplechainTestnet',
}

export const chainFullNames: Record<ChainId, string> = {
  [ChainId.BSC]: 'BNB Chain',
  [ChainId.BSC_TESTNET]: 'BNB Chain Testnet',
  [ChainId.SIMPLECHAIN_TESTNET]: 'SimpleChain Testnet',
}

export const chainNamesInKebabCase = {
  [ChainId.BSC]: 'bsc',
  [ChainId.BSC_TESTNET]: 'bsc-testnet',
  [ChainId.SIMPLECHAIN_TESTNET]: 'simplechain-testnet',
} as const

export const mainnetChainNamesInKebabCase = {
  [ChainId.BSC]: 'bsc',
  [ChainId.BSC_TESTNET]: 'bsc',
  [ChainId.SIMPLECHAIN_TESTNET]: 'simplechain',
} as const

const legacyChainNames: [string, UnifiedChainId][] = [
  ['Binance Smart Chain', ChainId.BSC],
  ['BNB Smart Chain', ChainId.BSC],
]

export const chainNameToChainId = Object.entries(chainNames).reduce((acc, [chainId, chainName]) => {
  return {
    [chainName]: +chainId as unknown as ChainId,
    ...acc,
  }
}, {} as Record<string, UnifiedChainId>)

const chainFullNamesToChainId = Object.entries(chainFullNames).reduce((acc, [chainId, chainName]) => {
  return {
    [chainName]: +chainId as unknown as UnifiedChainId,
    ...acc,
  }
}, {} as Record<string, UnifiedChainId>)

const kebabCaseNamesToChainId = Object.entries(chainNamesInKebabCase).reduce((acc, [chainId, chainName]) => {
  return {
    [chainName]: +chainId as unknown as UnifiedChainId,
    ...acc,
  }
}, {} as Record<string, UnifiedChainId>)

export const allCasesNameToChainId = Object.entries({
  ...chainFullNamesToChainId,
  ...kebabCaseNamesToChainId,
  ...chainNameToChainId,
})
  .concat(legacyChainNames)
  .reduce((acc, [chainName, chainId]) => {
    return {
      [chainName]: +chainId as UnifiedChainId,
      [chainName.toLowerCase()]: +chainId as UnifiedChainId,
      ...acc,
    }
  }, {} as Record<string, UnifiedChainId>)

// @see https://github.com/DefiLlama/defillama-server/blob/master/common/chainToCoingeckoId.ts
// @see https://github.com/DefiLlama/chainlist/blob/main/constants/chainIds.json
export const defiLlamaChainNames: Record<ChainId, string> = {
  [ChainId.BSC]: 'bsc',
  [ChainId.BSC_TESTNET]: '',
  [ChainId.SIMPLECHAIN_TESTNET]: '',
}
