import { ChainId } from '@pancakeswap/chains'
import { useQuery } from '@tanstack/react-query'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useCallback } from 'react'
import { Address } from 'viem'
import { bsc } from 'viem/chains'

async function fetchMEVStatus(account: Address): Promise<{ mevEnabled: boolean; isError: boolean }> {
  if (!window.ethereum || (!window.ethereum as any)?.request || account === '0x') {
    throw new Error('Ethereum provider not found')
  }

  try {
    const result = await (window.ethereum as any)?.request({
      method: 'eth_call',
      params: [
        {
          from: account,
          to: '0x0000000000000000000000000000000000000048',
          value: '0x30',
        },
      ],
    })
    return { mevEnabled: result === '0x30', isError: false }
  } catch (error) {
    console.error('Error checking MEV status:', error)
    return { mevEnabled: false, isError: true }
  }
}

export function useIsMEVEnabled() {
  const { account, chainId } = useActiveWeb3React()
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['isMEVEnabled'],
    queryFn: () => fetchMEVStatus(account ?? '0x'),
    enabled: Boolean(account) && chainId === ChainId.BSC,
    staleTime: 60000,
    retry: false,
  })

  return { isMEVEnabled: data?.mevEnabled ?? false, isLoading, refetch, isError: data?.isError ?? false }
}

export const useShouldShowMEVToggle = () => {
  const { isMEVEnabled, isLoading, isError } = useIsMEVEnabled()
  return !isMEVEnabled && !isLoading && !isError
}

export const useAddMevRpc = (onSuccess?: () => void, onBeforeStart?: () => void, onFinish?: () => void) => {
  const addMevRpc = useCallback(async () => {
    onBeforeStart?.()
    try {
      const networkParams = {
        chainId: '0x38', // Chain ID in hexadecimal (56 for Binance Smart Chain)
        chainName: 'PancakeSwap MEV Guard',
        rpcUrls: ['https://bscrpc.pancakeswap.finance'], // PancakeSwap MEV RPC
        nativeCurrency: bsc.nativeCurrency,
        blockExplorerUrls: [bsc.blockExplorers.default.url],
      }

      // Check if the Ethereum provider is available
      if (window.ethereum) {
        try {
          // Prompt the wallet to add the custom network
          await (window.ethereum as any)?.request({
            method: 'wallet_addEthereumChain',
            params: [networkParams],
          })
          console.info('RPC network added successfully!')
          onSuccess?.()
        } catch (error) {
          if ((error as any).code === -32601) {
            console.error('wallet_addEthereumChain is not supported')
          } else console.error('Error adding RPC network:', error)
        }
      } else {
        console.warn('Ethereum provider not found. Please check your wallet')
      }
    } catch (error) {
      console.error(error)
    } finally {
      onFinish?.()
    }
  }, [onBeforeStart, onSuccess, onFinish])
  return { addMevRpc }
}
