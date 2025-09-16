import { atomWithAsyncRetry } from 'utils/atomWithAsyncRetry'
import { PCS_LIMIT_ORDER_POOLS_URL } from '../../constants'
import { SupportedPoolListItem } from '../../types'

const TEST_POOLS: SupportedPoolListItem[] = [
  {
    chainId: 56,
    // poolId: '0x737a7d974a19bafb34C8D74d898188c9b59689b91f291fa6ade69f71fa0f5afa',
    poolId: '0xc6ff22ebc3f8c8edc551bf648bbf685c60678f7a740a01c12b591a0004b7730d',
    currency0: '0x0000000000000000000000000000000000000000',
    currency1: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
  },
]

// TODO: Add Support for chainId, by separating atomFamily perhaps
export const supportedPoolsListAtom = atomWithAsyncRetry<SupportedPoolListItem[]>({
  asyncFn: async () => {
    const response = await fetch(PCS_LIMIT_ORDER_POOLS_URL)
    if (!response.ok) throw new Error('Unable to fetch supported pools for PCS Limit Order')
    const data: SupportedPoolListItem[] = await response.json()
    const allPools = [...data, ...TEST_POOLS]
    return allPools
  },
  delayMs: 2000,
  maxRetries: 5,
  errorReportKey: 'pcs-limit-order-fetch-supported-pools-error',
  fallbackValue: [],
  // TODO: Add fallback to few pools like BNB-CAKE from FE side
})
