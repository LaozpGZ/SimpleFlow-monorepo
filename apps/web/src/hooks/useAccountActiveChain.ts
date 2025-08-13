import { isEvm } from '@pancakeswap/chains'
import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'

import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'

export const useActiveChainId = (checkChainId?: number) => {
  const { isNotMatched, isWrongNetwork, chainId } = useAccountActiveChain()
  return {
    chainId,
    isNotMatched,
    isWrongNetwork: checkChainId ? isWrongNetwork && checkChainId !== chainId : isWrongNetwork,
  }
}

export const useActiveChainIdRef = () => {
  const { chainId } = useAccountActiveChain()

  const ref = useRef(chainId)
  useEffect(() => {
    ref.current = chainId
  }, [chainId])
  return ref
}

export const useAccountActiveChain = () => {
  const result = useAtomValue(accountActiveChainAtom)
  const { chainId, account, solanaAccount } = result
  const unifiedAccount = isEvm(chainId) ? account : solanaAccount
  return { ...result, unifiedAccount }
}

export function useSyncWalletState() {
  const [queryChainId, refresh] = useAtom(queryChainIdAtom)

  const { query } = useRouter()
  const chain = query.chain
  const wagmiAccountState = useAccount()
  const switchNetwork = useSwitchNetworkLocal()
  const setProxy = useSetAtom(accountActiveChainAtom)

  // Query Change
  useValueChanged(() => {
    if (chain) {
      refresh()
    }
  }, [chain, refresh])

  // wagmi change
  useValueChanged(() => {
    const { chainId: wagmiChainId } = wagmiAccountState
    if (wagmiChainId) {
      switchNetwork(wagmiChainId)
    }
  }, [wagmiAccountState])

  // query chainId Changes
  // sync chainId
  useEffect(() => {
    const wagmiState = wagmiAccountState
    const { chainId: wagmiChainId, address } = wagmiState
    const chainId = queryChainId

    const isNotMatched = isEvm(chainId)
      ? Boolean(wagmiChainId && wagmiChainId !== chainId)
      : chainId !== NonEVMChainId.SOLANA

    setProxy((prev) => {
      return {
        ...prev,
        chainId, // Using this as single source of truth
        account: address,
        unifiedAccount: chainId === NonEVMChainId.SOLANA ? prev.solanaAccount : address,
        isWrongNetwork: isNotMatched,
        isNotMatched,
      }
    })
  }, [queryChainId, wagmiAccountState])
}

export default useAccountActiveChain
