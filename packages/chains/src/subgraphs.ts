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

export function getStableSwapSubgraphs(_params: Pick<SubgraphParams, 'theGraphApiKey'> = {}) {
  // theGraphApiKey removed - using simpleflow.finance endpoints or null
  return {
    [ChainId.BSC]: null,
    [ChainId.ARBITRUM_ONE]: null,
    [ChainId.SIMPLECHAIN]: null,
  } as const
}

export function getV3Subgraphs(_params: SubgraphParams) {
  // All external subgraphs removed - using simpleflow.finance endpoints in apps/web/src/config/constants/endpoints.ts
  return {
    [ChainId.ETHEREUM]: null,
    [ChainId.GOERLI]: null,
    [ChainId.BSC]: null,
    [ChainId.BSC_TESTNET]: null,
    [ChainId.ARBITRUM_ONE]: null,
    [ChainId.ARBITRUM_GOERLI]: null,
    [ChainId.ZKSYNC]: null,
    [ChainId.ZKSYNC_TESTNET]: null,
    [ChainId.LINEA]: null,
    [ChainId.LINEA_TESTNET]: null,
    [ChainId.BASE]: null,
    [ChainId.BASE_TESTNET]: null,
    [ChainId.OPBNB]: null,
    [ChainId.OPBNB_TESTNET]: null,
    [ChainId.SCROLL_SEPOLIA]: null,
    [ChainId.SEPOLIA]: null,
    [ChainId.ARBITRUM_SEPOLIA]: null,
    [ChainId.BASE_SEPOLIA]: null,
    [ChainId.SIMPLECHAIN]: null,
    [ChainId.SIMPLECHAIN_TESTNET]: null,
  } as const satisfies Record<ChainId, string | null>
}

export function getV2Subgraphs(_params: SubgraphParams) {
  // All external subgraphs removed - using simpleflow.finance endpoints in apps/web/src/config/constants/endpoints.ts
  return {
    [ChainId.BSC]: null,
    [ChainId.ETHEREUM]: null,
    [ChainId.ZKSYNC_TESTNET]: null,
    [ChainId.ZKSYNC]: null,
    [ChainId.LINEA_TESTNET]: null,
    [ChainId.ARBITRUM_ONE]: null,
    [ChainId.LINEA]: null,
    [ChainId.BASE]: null,
    [ChainId.OPBNB]: null,
    [ChainId.SIMPLECHAIN]: null,
  }
}

export function getBlocksSubgraphs(_params: SubgraphParams) {
  // All external subgraphs removed - using simpleflow.finance endpoints in apps/web/src/config/constants/endpoints.ts
  return {
    [ChainId.BSC]: null,
    [ChainId.ETHEREUM]: null,
    [ChainId.ZKSYNC]: null,
    [ChainId.ARBITRUM_ONE]: null,
    [ChainId.LINEA]: null,
    [ChainId.BASE]: null,
    [ChainId.OPBNB]: null,
    [ChainId.SIMPLECHAIN]: null,
  } as const
}
