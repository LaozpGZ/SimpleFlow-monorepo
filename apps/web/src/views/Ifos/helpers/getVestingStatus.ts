import { PoolIds, UserVestingData } from '@pancakeswap/ifos'
import BigNumber from 'bignumber.js'

export const getVestingStatus = (
  userVestingData: UserVestingData | null | undefined,
): 'notStarted' | 'live' | 'end' => {
  if (!userVestingData) {
    return 'notStarted'
  }
  const currentTime = Date.now()
  const vestingStartTimeMs = new BigNumber(userVestingData.vestingStartTime).times(1000)
  const pool = userVestingData[PoolIds.poolBasic] || userVestingData[PoolIds.poolUnlimited]
  const vestingEndTimeMs = vestingStartTimeMs.div(1000).plus(pool.vestingInformationDuration).times(1000)

  if (currentTime < vestingStartTimeMs.toNumber()) {
    return 'notStarted'
  }
  if (currentTime < vestingEndTimeMs.toNumber()) {
    return 'live'
  }
  return 'end'
}
