import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem/accounts'
import { useAccount } from 'wagmi'

interface W3WVerifyResponse {
  code: string
  success: boolean
  data: boolean
}

export enum VerifyStatus {
  ineligible = 'ineligible',
  eligible = 'eligible',
  restricted = 'restricted',
}

const verifyW3WAccount = async (address: Address): Promise<VerifyStatus> => {
  try {
    const timestamp = Date.now()
    const response = await fetch(
      `https://www.binance.com/bapi/defi/v1/public/wallet-direct/wallet/address/verify?address=${address}&timestamp=${timestamp}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-gray-env': 'infra',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
        },
      },
    )
    const result: W3WVerifyResponse = await response.json()

    if (result?.code === '351083') {
      return VerifyStatus.restricted
    }

    if (result.code === '000000' && result.success && result.data) {
      return VerifyStatus.eligible
    }

    return VerifyStatus.ineligible
  } catch (error) {
    console.error('Error verifying W3W account:', error)
    return VerifyStatus.ineligible
  }
}

export const useW3WAccountVerify = () => {
  const { address } = useAccount()

  const { data, isLoading, error } = useQuery({
    queryKey: ['w3w-account-verify', address],
    queryFn: async () => {
      if (!address) throw new Error('No address provided')
      return verifyW3WAccount(address)
    },
    enabled: !!address,
  })

  return {
    verifyStatus: data,
    isLoading,
    error,
  }
}
