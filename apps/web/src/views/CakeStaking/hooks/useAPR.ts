import BigNumber from 'bignumber.js'
import { CAKE_PER_BLOCK } from 'config'
import { masterChefV2ABI } from 'config/abi/masterchefV2'
import { getMasterChefV2Address } from 'utils/addressHelpers'
import { PublicClient } from 'viem'

// A mock pool which OP harvests weekly and inject rewards to RevenueSharingVeCake
const pid = 172n

export const fetchCakePoolEmission = async (client: PublicClient, chianId?: number): Promise<BigNumber> => {
  const [cakeRateToSpecialFarm, poolInfo, totalSpecialAllocPoint] = await client.multicall({
    contracts: [
      {
        address: getMasterChefV2Address(chianId)!,
        abi: masterChefV2ABI,
        functionName: 'cakeRateToSpecialFarm',
      } as const,
      {
        address: getMasterChefV2Address(chianId)!,
        abi: masterChefV2ABI,
        functionName: 'poolInfo',
        args: [pid],
      } as const,
      {
        address: getMasterChefV2Address(chianId)!,
        abi: masterChefV2ABI,
        functionName: 'totalSpecialAllocPoint',
      } as const,
    ],
    allowFailure: false,
  })

  const cakeRate = cakeRateToSpecialFarm ?? 0n
  const allocPoint = poolInfo[2] ?? 0n
  const totalAlloc = totalSpecialAllocPoint ?? 1n

  return new BigNumber(CAKE_PER_BLOCK)
    .times(new BigNumber(cakeRate.toString()).div(1e12))
    .times(allocPoint.toString())
    .div(totalAlloc.toString())
}

const SECONDS_IN_YEAR = 31536000 // 365 * 24 * 60 * 60

export const BRIBE_APR = 20
