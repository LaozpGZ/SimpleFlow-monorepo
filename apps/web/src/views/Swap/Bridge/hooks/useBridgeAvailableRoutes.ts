import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { CROSSCHAIN_SUPPORTED_CHAINS } from 'quoter/utils/crosschain-utils/config'
import { isSolana, NonEVMChainId } from '@pancakeswap/chains'
import { GetAvailableRoutesParams, getBridgeAvailableRoutes } from '../api'

export function useBridgeAvailableRoutes(params?: GetAvailableRoutesParams) {
  const { originChainId, destinationChainId, originToken, destinationToken } = params || {}

  return useQuery({
    queryKey: ['bridge-available-routes', originChainId, destinationChainId, originToken, destinationToken],
    queryFn: () => getBridgeAvailableRoutes({ originChainId, destinationChainId, originToken, destinationToken }),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })
}

export function useBridgeAvailableChains(params?: GetAvailableRoutesParams) {
  const { data, isLoading } = useBridgeAvailableRoutes()

  // only return chains array,add origin chain id to the array
  const chains = useMemo(() => {
    if (!params?.originChainId || isSolana(params?.originChainId)) {
      return CROSSCHAIN_SUPPORTED_CHAINS
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
  }, [data, params?.originChainId])

  return useMemo(() => {
    return {
      chains,
      loading: isLoading,
    }
  }, [chains, isLoading])
}
