import { useCallback } from 'react'
import { v4 } from 'uuid'
import { Address, Hex, keccak256 } from 'viem'
import { useAccount, useSignMessage } from 'wagmi'

export const useW3WAccountSign = () => {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const sign = useCallback(async () => {
    if (!address) throw new Error('No address provided')
    const timestamp = Date.now() + 1000 * 60 * 20 // now + 20 minutes
    const nonce = v4()
    const digest = keccak256([address, timestamp.toString(), nonce].join(' ') as `0x${string}`)

    const signature = await signMessageAsync({ message: digest })

    return w3wSign({
      address,
      signature,
      timestamp,
      nonce,
    })
  }, [address, signMessageAsync])

  return sign
}

interface W3WSignResponse {
  code: SignResponseCode
  success: boolean
  message: string
  data: {
    // if address is not a w3w address, signature will be null
    signature: string | null
    // time in seconds
    expiredAt: number
  }
}

enum SignResponseCode {
  Normal = '000000',
  SystemError = '000001',
  IllegalParams = '000002',
  SignatureError = '001012',
  IllegalTimestamp = '351005',
  IllegalNonce = '351082',
  IllegalAddress = '351026',
}

const w3wSign = async ({
  address,
  signature,
  timestamp,
  nonce,
}: {
  address: Address
  signature: Hex
  timestamp: number
  nonce: string
}) => {
  try {
    const response = await fetch(
      `https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/address/sign?address=${address}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gray-env': 'infra',
        },
        body: JSON.stringify({
          timestamp,
          address,
          nonce,
          signature,
        }),
      },
    )
    const result: W3WSignResponse = await response.json()

    if (result.code !== SignResponseCode.Normal) {
      throw new Error('Failed to sign')
    }

    return result.data
  } catch (error) {
    console.error('Error signing W3W account:', error)
    return {
      signature: null,
      expiredAt: 0,
    }
  }
}
