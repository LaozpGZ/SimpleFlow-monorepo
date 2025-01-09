import { ChainId } from '@pancakeswap/chains'
import { ifos } from '../../config'

export const useCurrentIDOConfig = () => {
  return { activeIfo: { ...ifos[1], chainId: ChainId.BSC_TESTNET }, isPending: false }
}
