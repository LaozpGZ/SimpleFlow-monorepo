import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useActiveChainId } from './useActiveChainId'

/**
 * Provides a web3 provider with or without user's signer
 * Recreate web3 instance only if the provider change
 */
const useAccountActiveChain = () => {
  const params = useSearchParams()
  const { address: _account, status, connector } = useAccount()
  const accountFromUrl = params.get('_account') as `0x${string}` | undefined
  const account = accountFromUrl || _account
  const { chainId } = useActiveChainId()

  return useMemo(() => ({ account, chainId, status, connector }), [account, chainId, connector, status])
}

export default useAccountActiveChain
