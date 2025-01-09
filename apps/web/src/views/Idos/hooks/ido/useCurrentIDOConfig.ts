import { ChainId } from '@pancakeswap/chains'
import { ifos } from '../../config'

export const useCurrentIDOConfig = () => {
  return { activeIfo: { ...ifos[0], chainId: ChainId.BSC }, isPending: false }
}
