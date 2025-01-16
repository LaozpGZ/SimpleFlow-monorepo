import { type Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useIDOContract } from 'hooks/useContract'
import { useMemo } from 'react'
import { useIDOCurrencies } from './useIDOCurrencies'
import { useIDOUserInfo } from './useIDOUserInfo'

export type IDOUserStatus = {
  stakedAmount: CurrencyAmount<Currency>
  offeringCurrency: Currency | undefined
  stakeTax: CurrencyAmount<Currency>
  stakeRefund: CurrencyAmount<Currency>
}

export const useIDOUserStatus = () => {
  const { data: userInfo } = useIDOUserInfo()
  const { data: offeringAndRefundingAmounts } = useViewUserOfferingAndRefundingAmounts()
  const { stakeCurrency, offeringCurrency } = useIDOCurrencies()

  const stakedAmount = useMemo(() => {
    if (!stakeCurrency || !userInfo) return undefined
    return CurrencyAmount.fromRawAmount(stakeCurrency, userInfo.amountPool)
  }, [stakeCurrency, userInfo])

  const stakeTax = useMemo(() => {
    if (!stakeCurrency) return undefined
    return CurrencyAmount.fromRawAmount(stakeCurrency, offeringAndRefundingAmounts?.userTaxAmount ?? 0n)
  }, [stakeCurrency, offeringAndRefundingAmounts])

  const stakeRefund = useMemo(() => {
    if (!stakeCurrency) return undefined
    return CurrencyAmount.fromRawAmount(stakeCurrency, offeringAndRefundingAmounts?.userRefundingAmount ?? 0n)
  }, [stakeCurrency, offeringAndRefundingAmounts])

  const claimableAmount = useMemo(() => {
    if (!offeringCurrency) return undefined
    return CurrencyAmount.fromRawAmount(offeringCurrency, offeringAndRefundingAmounts?.userOfferingAmount ?? 0n)
  }, [offeringCurrency, offeringAndRefundingAmounts])

  return {
    stakedAmount,
    stakeTax,
    stakeRefund,
    claimableAmount,
  }
}

const useViewUserOfferingAndRefundingAmounts = () => {
  const idoContract = useIDOContract()
  const { account } = useAccountActiveChain()

  return useQuery({
    queryKey: ['idoUserOfferingAndRefundingAmounts', idoContract?.address, account],
    queryFn: async (): Promise<{ userOfferingAmount: bigint; userRefundingAmount: bigint; userTaxAmount: bigint }> => {
      if (!idoContract) throw new Error('IDO contract not found')
      const [userOfferingAmount, userRefundingAmount, userTaxAmount] =
        await idoContract.read.viewUserOfferingAndRefundingAmounts([account!])
      return { userOfferingAmount, userRefundingAmount, userTaxAmount }
    },
    enabled: !!account && !!idoContract,
  })
}
