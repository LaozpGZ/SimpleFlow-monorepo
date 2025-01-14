import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem/accounts'
import { useAccount } from 'wagmi'

interface W3WVerifyResponse {
  code: string
  success: boolean
  data: boolean
}

const verifyW3WAccount = async (address: Address): Promise<boolean> => {
  try {
    const timestamp = Date.now()
    const response = await fetch(`/api/w3w/verify?address=${address}&timestamp=${timestamp}`)
    const result: W3WVerifyResponse = await response.json()

    if (result.code !== '000000' || !result.success) {
      throw new Error('Failed to verify account')
    }

    return result.data
  } catch (error) {
    console.error('Error verifying W3W account:', error)
    return false
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
    isVerified: data,
    isLoading,
    error,
  }
}
