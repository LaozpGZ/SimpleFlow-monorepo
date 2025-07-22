import BN from 'bignumber.js'
import { Currency, CurrencyAmount, UnifiedCurrency } from '@pancakeswap/sdk'

import { useSolanaTokenBalance } from 'state/token/solanaTokenBalances'
import { useCurrencyBalance } from '../state/wallet/hooks'
import useAccountActiveChain from './useAccountActiveChain'

export interface UnifiedBalance {
  amount: CurrencyAmount<UnifiedCurrency>
  raw?: BN
}

export function useUnifiedCurrencyBalance(currency: UnifiedCurrency): UnifiedBalance | undefined {
  const { account: evmAccount, solanaAccount } = useAccountActiveChain()
  const isSolana = 'programId' in currency
  const solanaBalance = useSolanaTokenBalance(solanaAccount, isSolana ? currency.address : undefined)

  const evmBalance = useCurrencyBalance(evmAccount, currency as Currency)

  if (isSolana && solanaBalance) {
    return {
      amount: CurrencyAmount.fromRawAmount(currency, solanaBalance.balance.toString()),
      raw: solanaBalance.balance,
    }
  }
  if (evmBalance) {
    return {
      amount: evmBalance,
      raw: new BN(evmBalance.toExact()),
    }
  }
  return undefined
}
