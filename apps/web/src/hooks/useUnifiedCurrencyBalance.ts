import { Currency, CurrencyAmount, UnifiedCurrency, UnifiedCurrencyAmount } from '@pancakeswap/sdk'

import { useSolanaTokenBalance } from 'state/token/solanaTokenBalances'
import { useCurrencyBalance } from '../state/wallet/hooks'
import useAccountActiveChain from './useAccountActiveChain'

export type UnifiedBalance = CurrencyAmount<Currency> | UnifiedCurrencyAmount<UnifiedCurrency>

export function useUnifiedCurrencyBalance(currency?: UnifiedCurrency | null): UnifiedBalance | undefined {
  const { account: evmAccount, solanaAccount } = useAccountActiveChain()
  const isSolana = currency && 'programId' in currency
  const solanaBalance = useSolanaTokenBalance(solanaAccount, isSolana ? currency.address : undefined)

  const evmBalance = useCurrencyBalance(evmAccount, currency as Currency)

  if (isSolana && solanaBalance) {
    return UnifiedCurrencyAmount.fromRawAmount(currency, solanaBalance.balance.toString())
  }
  if (evmBalance) {
    return evmBalance
  }
  return undefined
}
