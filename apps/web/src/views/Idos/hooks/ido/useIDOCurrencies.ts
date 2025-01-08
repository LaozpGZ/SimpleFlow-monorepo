import { useQuery } from '@tanstack/react-query'
import { QUERY_SETTINGS_IMMUTABLE } from 'config/constants'
import { useCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useIDOContract } from 'hooks/useContract'
import { getViemClients } from 'utils/viem'
import type { Address } from 'viem/accounts'

type IDOAddresses = {
  lpToken: Address
  offeringToken: Address
  adminAddress: Address
}

export const useIDOAddresses = () => {
  const { chainId } = useActiveChainId()
  const idoContract = useIDOContract()

  return useQuery({
    queryKey: ['idoAddresses', chainId],
    queryFn: async (): Promise<IDOAddresses> => {
      const publicClient = getViemClients({ chainId })
      if (!idoContract || !publicClient) throw new Error('IDO contract not found')

      const [lpToken, offeringToken, adminAddress] = await publicClient.multicall({
        allowFailure: false,
        contracts: [
          {
            address: idoContract.address,
            abi: idoContract.abi,
            functionName: 'addresses',
            args: [0],
          },
          {
            address: idoContract.address,
            abi: idoContract.abi,
            functionName: 'addresses',
            args: [1],
          },
          {
            address: idoContract.address,
            abi: idoContract.abi,
            functionName: 'addresses',
            args: [2],
          },
        ],
      })

      return {
        lpToken,
        offeringToken,
        adminAddress,
      }
    },
    enabled: !!idoContract,
    ...QUERY_SETTINGS_IMMUTABLE,
  })
}

export const useIDOCurrencies = () => {
  const { data: addresses } = useIDOAddresses()
  const stakeCurrency = useCurrency(addresses?.lpToken)
  const offeringCurrency = useCurrency(addresses?.offeringToken)

  return {
    stakeCurrency,
    offeringCurrency,
  }
}
