import { ChainId } from './chainId'

type SubgraphParams = {
  noderealApiKey?: string
  theGraphApiKey?: string
}

const publicSubgraphParams = {}

export const V3_SUBGRAPHS = getV3Subgraphs(publicSubgraphParams)

export const V2_SUBGRAPHS = getV2Subgraphs(publicSubgraphParams)

export const BLOCKS_SUBGRAPHS = getBlocksSubgraphs(publicSubgraphParams)

export const STABLESWAP_SUBGRAPHS = getStableSwapSubgraphs(publicSubgraphParams)

export function getStableSwapSubgraphs({ theGraphApiKey }: Pick<SubgraphParams, 'theGraphApiKey'> = {}) {
  return {
    [ChainId.BSC]: `https://gateway-arbitrum.network.thegraph.com/api/${theGraphApiKey}/subgraphs/id/C5EuiZwWkCge7edveeMcvDmdr7jjc1zG4vgn8uucLdfz`,
    [ChainId.BSC_TESTNET]: null,
    [ChainId.SIMPLECHAIN_TESTNET]: null,
  } as const
}

export function getV3Subgraphs({ theGraphApiKey }: SubgraphParams) {
  return {
    [ChainId.BSC]: `https://gateway-arbitrum.network.thegraph.com/api/${theGraphApiKey}/subgraphs/id/Hv1GncLY5docZoGtXjo4kwbTvxm3MAhVZqBZE4sUT9eZ`,
    [ChainId.BSC_TESTNET]: `https://gateway-arbitrum.network.thegraph.com/api/${theGraphApiKey}/subgraphs/id/7xd5KmL3FbzRYbmAM9SSe4wdrsJV71pJQhCBqzU7y8Qi`,
    [ChainId.SIMPLECHAIN_TESTNET]: null,
  } as const satisfies Record<ChainId, string | null>
}

export function getV2Subgraphs(_params: SubgraphParams = {}) {
  return {
    [ChainId.BSC]: null,
    [ChainId.BSC_TESTNET]: null,
    [ChainId.SIMPLECHAIN_TESTNET]: null,
  }
}

export function getBlocksSubgraphs(_params: SubgraphParams = {}) {
  return {
    [ChainId.BSC]: 'https://api.thegraph.com/subgraphs/name/pancakeswap/blocks',
    [ChainId.BSC_TESTNET]: null,
    [ChainId.SIMPLECHAIN_TESTNET]: null,
  } as const
}
