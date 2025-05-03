import { useQuery } from '@tanstack/react-query'
import { GetAvailableRoutesParams, getBridgeAvailableRoutes } from '../api'

export function useBridgeAvailableRoutes(params?: GetAvailableRoutesParams) {
  const { originChainId, destinationChainId, originToken, destinationToken } = params || {}

  return useQuery({
    queryKey: ['bridge-available-routes', originChainId, destinationChainId, originToken, destinationToken],
    queryFn: () => getBridgeAvailableRoutes({ originChainId, destinationChainId, originToken, destinationToken }),
  })
}
