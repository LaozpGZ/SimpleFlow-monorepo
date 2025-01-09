import { PoolIds, UserVestingData } from '@pancakeswap/ifos'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { useAccount } from 'wagmi'

import { FAST_INTERVAL } from 'config/constants'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useIfoConfigsAcrossChains } from 'hooks/useIfoConfig'

import { fetchUserWalletIfoData, VestingData } from './fetchUserWalletIfoData'

const POOLS = [PoolIds.poolBasic, PoolIds.poolUnlimited]

const isPoolEligible = (poolId: PoolIds, userVestingData: UserVestingData) => {
  const poolData = userVestingData[poolId]
  const currentTimeStamp = Date.now()
  if (!poolData) return false

  if (poolData.offeringAmountInToken.lte(0)) {
    return false
  }

  if (poolData.vestingComputeReleasableAmount.gt(0)) {
    return true
  }

  const vestingStartTime = new BigNumber(userVestingData.vestingStartTime)
  const vestingEndTime = vestingStartTime.plus(poolData.vestingInformationDuration).times(1000)

  return vestingEndTime.gte(currentTimeStamp)
}

export const isVestingEnd = (vestingData: VestingData) => {
  const pool = vestingData.userVestingData[PoolIds.poolBasic] || vestingData.userVestingData[PoolIds.poolUnlimited]
  const currentTimeStamp = Date.now()
  const vestingEndTime = (vestingData.userVestingData.vestingStartTime + pool.vestingInformationDuration) * 1000
  return vestingEndTime < currentTimeStamp
}

const isEligibleVestingData = (ifo: VestingData) => {
  const { userVestingData } = ifo
  return POOLS.some((poolId) => isPoolEligible(poolId, userVestingData))
}

const useFetchVestingData = () => {
  const { address: account } = useAccount()

  const { chainId } = useActiveChainId()
  const configs = useIfoConfigsAcrossChains()

  // Filter IFOs that are version >= 3.2 and have a vesting title
  const allVestingIfo = configs?.filter((ifo) => ifo.version >= 3.2 && ifo.vestingTitle) || []

  const { data: vestingData, refetch } = useQuery<VestingData>({
    queryKey: ['vestingData', account],
    queryFn: async () => {
      const allDataSettled = await Promise.allSettled(allVestingIfo.map((ifo) => fetchUserWalletIfoData(ifo, account)))
      const allData = allDataSettled
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<VestingData>).value)

      const filteredData = allData.filter(isEligibleVestingData)

      const sortedData = filteredData.toSorted((a, b) => {
        if (a.ifo.chainId === chainId && b.ifo.chainId !== chainId) return -1
        if (a.ifo.chainId !== chainId && b.ifo.chainId === chainId) return 1
        return 0
      })

      return sortedData[0]
    },
    enabled: Boolean(account),
    refetchOnWindowFocus: false,
    refetchInterval: FAST_INTERVAL,
    staleTime: FAST_INTERVAL,
  })

  return {
    data: vestingData || null,
    fetchUserVestingData: refetch,
  }
}

export default useFetchVestingData
