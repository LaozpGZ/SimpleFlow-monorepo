import { ChainId } from '@pancakeswap/chains'
import { useQuery } from '@tanstack/react-query'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useMemo } from 'react'

async function fetchMEVStatus(): Promise<boolean> {
  if (!window.ethereum || (!window.ethereum as any)?.request) {
    throw new Error('Ethereum provider not found')
  }

  try {
    const result = await (window.ethereum as any)?.request({
      method: 'eth_call',
      params: [
        {
          to: '0x0000000000000000000000000000000000000048',
          value: '0x30',
        },
      ],
    })
    return result === '0x30'
  } catch (error) {
    console.error('Error checking MEV status:', error)
    return false
  }
}

export function useIsMEVEnabled() {
  const isMetaMask = useIsConnectedMetaMask()

  const { data, isLoading } = useQuery({
    queryKey: ['isMEVEnabled'],
    queryFn: fetchMEVStatus,
    enabled: isMetaMask,
    staleTime: Infinity,
    retry: false,
  })

  return { isMEVEnabled: data ?? false, isLoading }
}

export const useIsConnectedMetaMask = () => {
  const { account, chainId } = useActiveWeb3React()
  return useMemo(() => {
    return Boolean(account) && Boolean(window.ethereum?.isMetaMask) && chainId === ChainId.BSC
  }, [account, chainId])
}

export const useShouldShowMEVToggle = () => {
  const isMetaMask = useIsConnectedMetaMask()
  const { isMEVEnabled, isLoading } = useIsMEVEnabled()
  return !isMEVEnabled && !isLoading && isMetaMask
}
