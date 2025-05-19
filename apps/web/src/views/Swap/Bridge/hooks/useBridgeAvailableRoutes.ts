import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { GetAvailableRoutesParams, getBridgeAvailableRoutes } from '../api'

export function useBridgeAvailableRoutes(params?: GetAvailableRoutesParams) {
  const { originChainId, destinationChainId, originToken, destinationToken } = params || {}

  return useQuery({
    queryKey: ['bridge-available-routes', originChainId, destinationChainId, originToken, destinationToken],
    queryFn: () => getBridgeAvailableRoutes({ originChainId, destinationChainId, originToken, destinationToken }),
  })
}

export function useBridgeAvailableChains(params?: GetAvailableRoutesParams) {
  const { data } = useBridgeAvailableRoutes()

  // only return chains array,add origin chain id to the array
  return useMemo(
    () => (data && params?.originChainId ? [...new Set(data.map((route) => route.destinationChainId))] : []),
    [data],
  )
}
