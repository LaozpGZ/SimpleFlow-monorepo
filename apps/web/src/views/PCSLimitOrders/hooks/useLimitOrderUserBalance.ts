import { useAccountActiveChain } from 'hooks/useAccountActiveChain'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { BigNumber as BN } from 'bignumber.js'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { parseUnits } from '@pancakeswap/utils/viem/parseUnits'
import { formattedAmountsAtom } from '../state/form/inputAtoms'
import { Field } from '../types/limitOrder.types'
import { inputCurrencyAtom, outputCurrencyAtom } from '../state/currency/currencyAtoms'

/**
 * Check token balance for Limit Order
 */
export const useLimitOrderUserBalance = () => {
  const { account } = useAccountActiveChain()
  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)
  const formattedAmounts = useAtomValue(formattedAmountsAtom)

  const [inputBalance] = useCurrencyBalances(account, [inputCurrency ?? undefined])
  const [outputBalance] = useCurrencyBalances(account, [outputCurrency ?? undefined])

  const isEnoughBalance = useMemo(() => {
    if (!inputBalance) return false
    const inputBalanceAmount = formatAmount(inputBalance, 6)
    if (!inputBalanceAmount) return false

    // Add some dust to account for gas
    const dust = inputCurrency?.isNative ? parseUnits('0.0001', inputCurrency.decimals) : 0n

    const requiredAmount = BN(formattedAmounts[Field.CURRENCY_A]).plus(dust.toString())

    return BN(inputBalanceAmount).gte(requiredAmount)
  }, [inputBalance, formattedAmounts, inputCurrency])

  return {
    inputBalance,
    outputBalance,
    isEnoughBalance,
  }
}
