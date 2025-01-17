import { type Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useIDOContract } from 'hooks/useContract'
import { useMemo } from 'react'
import { useIDOCurrencies } from './useIDOCurrencies'
import { useIDOUserInfo } from './useIDOUserInfo'

export type IDOUserStatus = {
  stakedAmount: CurrencyAmount<Currency> | undefined
  stakeTax: CurrencyAmount<Currency> | undefined
  stakeRefund: CurrencyAmount<Currency> | undefined
  claimableAmount: CurrencyAmount<Currency> | undefined
  claimed: boolean | undefined
}

export const useIDOUserStatus = (): [IDOUserStatus, IDOUserStatus] => {
  const { data: userInfo } = useIDOUserInfo()
  const { data: offeringAndRefundingAmounts } = useViewUserOfferingAndRefundingAmounts()
  const { stakeCurrency0, stakeCurrency1, offeringCurrency } = useIDOCurrencies()

  const stakedAmounts = useMemo(() => {
    if (!stakeCurrency0 || !stakeCurrency1 || !userInfo) return [undefined, undefined]
    return [
      CurrencyAmount.fromRawAmount(stakeCurrency0, userInfo[0].amountPool),
      CurrencyAmount.fromRawAmount(stakeCurrency1, userInfo[1].amountPool),
    ]
  }, [stakeCurrency0, stakeCurrency1, userInfo])

  const claimed = useMemo(() => {
    if (!userInfo) return [undefined, undefined]
    return [userInfo[0].claimedPool, userInfo[1].claimedPool]
  }, [userInfo])

  const stakeTax = useMemo(() => {
    if (!stakeCurrency0 || !stakeCurrency1) return [undefined, undefined]
    return [
      CurrencyAmount.fromRawAmount(stakeCurrency0, offeringAndRefundingAmounts?.[0].userTaxAmount ?? 0n),
      CurrencyAmount.fromRawAmount(stakeCurrency1, offeringAndRefundingAmounts?.[1].userTaxAmount ?? 0n),
    ]
  }, [stakeCurrency0, stakeCurrency1, offeringAndRefundingAmounts])

  const stakeRefund = useMemo(() => {
    if (!stakeCurrency0 || !stakeCurrency1) return [undefined, undefined]
    return [
      CurrencyAmount.fromRawAmount(stakeCurrency0, offeringAndRefundingAmounts?.[0].userRefundingAmount ?? 0n),
      CurrencyAmount.fromRawAmount(stakeCurrency1, offeringAndRefundingAmounts?.[1].userRefundingAmount ?? 0n),
    ]
  }, [stakeCurrency0, stakeCurrency1, offeringAndRefundingAmounts])

  const claimableAmount = useMemo(() => {
    if (!offeringCurrency) return [undefined, undefined]
    return [
      CurrencyAmount.fromRawAmount(offeringCurrency, offeringAndRefundingAmounts?.[0].userOfferingAmount ?? 0n),
      CurrencyAmount.fromRawAmount(offeringCurrency, offeringAndRefundingAmounts?.[1].userOfferingAmount ?? 0n),
    ]
  }, [offeringCurrency, offeringAndRefundingAmounts])

  return [
    {
      stakedAmount: stakedAmounts[0],
      stakeTax: stakeTax[0],
      stakeRefund: stakeRefund[0],
      claimableAmount: claimableAmount[0],
      claimed: claimed[0],
    },
    {
      stakedAmount: stakedAmounts[1],
      stakeTax: stakeTax[1],
      stakeRefund: stakeRefund[1],
      claimableAmount: claimableAmount[1],
      claimed: claimed[1],
    },
  ]
}

export type UserOfferingAndRefundingAmounts = {
  userOfferingAmount: bigint
  userRefundingAmount: bigint
  userTaxAmount: bigint
}

const useViewUserOfferingAndRefundingAmounts = () => {
  const idoContract = useIDOContract()
  const { account } = useAccountActiveChain()

  return useQuery({
    queryKey: ['idoUserOfferingAndRefundingAmounts', idoContract?.address, account],
    queryFn: async (): Promise<[UserOfferingAndRefundingAmounts, UserOfferingAndRefundingAmounts]> => {
      if (!idoContract || !account) throw new Error('IDO contract not found')
      const [userOfferingAmounts, userRefundingAmounts, userTaxAmounts] =
        await idoContract.read.viewUserOfferingAndRefundingAmountsForPools([account, [0, 1]])
      return [
        {
          userOfferingAmount: userOfferingAmounts[0],
          userRefundingAmount: userRefundingAmounts[0],
          userTaxAmount: userTaxAmounts[0],
        },
        {
          userOfferingAmount: userOfferingAmounts[1],
          userRefundingAmount: userRefundingAmounts[1],
          userTaxAmount: userTaxAmounts[1],
        },
      ]
    },
    enabled: !!account && !!idoContract,
  })
}
