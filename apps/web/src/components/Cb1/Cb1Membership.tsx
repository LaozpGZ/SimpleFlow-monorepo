import { getChainName } from '@pancakeswap/chains'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useEffect } from 'react'

export const Cb1Membership = () => {
  const { chainId, account } = useAccountActiveChain()
  const chainName = getChainName(chainId)

  useEffect(() => {}, [chainId, account])

  return null
}
