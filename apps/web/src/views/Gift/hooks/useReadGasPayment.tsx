import { useReadContract } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useMemo } from 'react'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { PancakeGiftV1Abi } from '../abis/PancakeGiftV1Abi'
import { GIFT_PANCAKE_V1_ADDRESS } from '../constants'

export const useReadGasPayment = () => {
  const { chainId } = useActiveChainId()
  const { data: gasPayment } = useReadContract({
    address: GIFT_PANCAKE_V1_ADDRESS,
    abi: PancakeGiftV1Abi,
    functionName: 'GAS_PAYMENT',
    chainId,
  })

  // either bigint or undefined
  return gasPayment as bigint | undefined
}

export const useReadGasPaymentAmount = () => {
  const nativeCurrency = useNativeCurrency()
  const gasPayment = useReadGasPayment()

  return useMemo(
    () => (gasPayment ? CurrencyAmount.fromRawAmount(nativeCurrency, gasPayment) : undefined),
    [gasPayment, nativeCurrency],
  )
}
