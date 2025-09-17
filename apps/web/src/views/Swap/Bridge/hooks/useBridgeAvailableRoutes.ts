import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { CROSSCHAIN_SUPPORTED_CHAINS } from 'quoter/utils/crosschain-utils/config'
import { ChainId, isSolana, NonEVMChainId } from '@pancakeswap/chains'
import { usePrivy } from '@privy-io/react-auth'
import { usePrivyWalletAddress } from 'wallet/Privy/hooks/usePrivyWalletAddress'
import { GetAvailableRoutesParams, getBridgeAvailableRoutes } from '../api'

export function useBridgeAvailableRoutes(params?: GetAvailableRoutesParams) {
  const { originChainId, destinationChainId, originToken, destinationToken } = params || {}

  // disabled solana bridge
  const diabled = isSolana(originChainId) || isSolana(destinationChainId)

  return useQuery({
    queryKey: ['bridge-available-routes', originChainId, destinationChainId, originToken, destinationToken],
    queryFn: () => getBridgeAvailableRoutes({ originChainId, destinationChainId, originToken, destinationToken }),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: !diabled,
  })
}

export function useBridgeAvailableChains(params?: GetAvailableRoutesParams) {
  const { data, isLoading } = useBridgeAvailableRoutes()
  // if privy login, exclude zkSync
  const { address: privyAddress } = usePrivyWalletAddress()

  // only return chains array,add origin chain id to the array
  const chains = useMemo(() => {
    if (!params?.originChainId || isSolana(params?.originChainId)) {
      return privyAddress
        ? CROSSCHAIN_SUPPORTED_CHAINS.filter((chainId) => chainId !== ChainId.ZKSYNC)
        : CROSSCHAIN_SUPPORTED_CHAINS
    }

    return data && params?.originChainId
      ? [
          params.originChainId,
          NonEVMChainId.SOLANA,
          ...new Set(
            data
              .filter((route) => route.originChainId === params.originChainId)
              .map((route) => route.destinationChainId),
          ),
        ]
      : []
  }, [data, params?.originChainId, privyAddress])

  return useMemo(() => {
    return {
      chains,
      loading: isLoading,
    }
  }, [chains, isLoading])
}
