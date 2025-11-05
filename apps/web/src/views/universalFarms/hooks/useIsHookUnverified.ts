import { ChainId } from '@pancakeswap/chains'
import { zeroAddress } from 'viem'
import { isAddressEqual } from 'utils'
import { useVerifyHookAddress } from 'hooks/useVerifyHookAddress'
import { getHookByAddress } from 'utils/getHookByAddress'

export const useIsHookUnverified = (data?: { chainId?: ChainId; hookAddress?: `0x${string}` }) => {
  const hookAddress = data && 'hookAddress' in data && data.hookAddress ? data.hookAddress : undefined
  const chainId = data?.chainId

  const staticWhitelisted = Boolean(isAddressEqual(hookAddress, zeroAddress) || getHookByAddress(chainId, hookAddress))

  const enabled = Boolean(chainId && hookAddress && !staticWhitelisted)

  const { isVerified, isLoading } = useVerifyHookAddress({
    chainId,
    hookAddress,
    enabled,
  })

  const isHookUnverified = enabled && !isLoading ? !isVerified : false

  return isHookUnverified
}
