import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import { useCakePrice } from 'hooks/useCakePrice'
import { useVeCakeBalance } from 'hooks/useTokenBalance'
import { useRevenueSharingCakePool, useRevenueSharingVeCake } from './useRevenueSharingProxy'
import { useCakeLockStatus } from './useVeCakeUserInfo'

export const useCakeExitInfo = () => {
  const { balance } = useVeCakeBalance()
  const { nativeSDXLockedAmount, proxyCakeLockedAmount, cakeV1Amount, cakeUnlockTime, cakeLockExpired } =
    useCakeLockStatus()
  const { data: veSDXShare, refetch: refetchRevenueShareVeCake } = useRevenueSharingVeCake()
  const { data: cakePoolShare, refetch: refetchRevenueShareCake } = useRevenueSharingCakePool()
  const cakePrice = useCakePrice()

  const availableClaim = BigNumber(veSDXShare.availableClaim).plus(cakePoolShare.availableClaim)

  const lockedCake = nativeSDXLockedAmount + proxyCakeLockedAmount + cakeV1Amount

  const unlockTime = Number(dayjs.unix(Number(cakeUnlockTime || 0)))

  return {
    myVeCake: balance,
    lockedCake: BigNumber(lockedCake.toString()),
    availableClaim,
    availableClaimUSD: availableClaim.times(cakePrice),
    cakePoolRewards: BigNumber(cakePoolShare.availableClaim),
    veSDXRewards: BigNumber(veSDXShare.availableClaim),
    cakePrice: cakePrice.toNumber(),
    nativeSDXLockedAmount,
    proxyCakeLockedAmount,
    cakeV1Amount,
    cakeLockExpired,
    unlockTime,
    refetchRevenueShareVeCake,
    refetchRevenueShareCake,
  }
}
