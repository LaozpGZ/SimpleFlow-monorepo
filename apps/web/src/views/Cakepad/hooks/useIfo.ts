import { isAddress } from 'viem/utils'
import { useIFOPoolInfo } from './ifo/useIFOPoolInfo'
import { useIFOInfo } from './ifo/useIFOInfo'
import { useIFOUserStatus } from './ifo/useIFOUserStatus'
import { useIfoV2Context } from '../contexts/useIfoV2Context'
import { IFOConfig } from '../ifov2.types'

const useIfo = () => {
  const ctx = useIfoV2Context()

  const info = useIFOInfo()
  const pools_ = useIFOPoolInfo()
  const users = useIFOUserStatus()

  const { config } = ctx
  const isValidContract = config.contractAddress && isAddress(config.contractAddress)

  // Return preset pools for FAQ and HowTo if no valid contract address
  const pools = isValidContract ? pools_ : (config.presetData as IFOConfig['presetData'])!.pools

  return { ...ctx, info, pools, users }
}

export default useIfo
