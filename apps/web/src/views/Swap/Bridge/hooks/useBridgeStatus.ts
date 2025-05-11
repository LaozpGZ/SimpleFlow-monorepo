import { useQuery } from '@tanstack/react-query'
import { getBridgeStatus } from '../api'

export const useBridgeStatus = (chainId: number, txHash: string) => {
  return useQuery({
    queryKey: ['bridge-status', chainId, txHash],
    queryFn: () => getBridgeStatus(chainId, txHash),
    refetchInterval: 1000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!chainId && !!txHash,
  })
}
