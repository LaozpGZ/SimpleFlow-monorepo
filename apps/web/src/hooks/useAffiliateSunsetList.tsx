import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

interface ZksyncAirDropWhiteListData {
  address: Address
}

export const fetchAffiliateList = async (account: Address): Promise<ZksyncAirDropWhiteListData> => {
  const response = await fetch(`https://proofs.pancakeswap.com/aff-program/v2/${account}`)
  if (!response.ok) {
    throw new Error('User is not in affiliate list')
  }
  return response.json() as Promise<any>
}

export const useUserIsInAffiliateListData = () => {
  const { address: account } = useAccount()
  const { data } = useQuery({
    queryKey: ['zksyncAirdropWhiteList', account],
    queryFn: async () => {
      try {
        return await fetchAffiliateList(account!)
      } catch (error) {
        return false
      }
    },
    enabled: Boolean(account),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  return useMemo(() => !!data, [data])
}
