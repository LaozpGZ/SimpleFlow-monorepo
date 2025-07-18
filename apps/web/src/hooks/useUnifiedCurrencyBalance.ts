import BN from 'bignumber.js'
import { Currency, UnifiedCurrency } from '@pancakeswap/sdk'

import { useSolanaTokenBalance } from 'state/token/solanaTokenBalances'
import { useCurrencyBalance } from '../state/wallet/hooks'
import useAccountActiveChain from './useAccountActiveChain'

export interface UnifiedBalance {
  amount: string
  raw?: BN
}

export function useUnifiedCurrencyBalance(currency: UnifiedCurrency): UnifiedBalance | undefined {
  const { account: evmAccount, solanaAccount } = useAccountActiveChain()
  // Determine if this is a Solana token by chainId (101)
  const isSolana = 'chainId' in currency && currency.chainId === 101 && 'address' in currency && !!currency.address
  const solanaBalance = useSolanaTokenBalance(solanaAccount, isSolana ? currency.address : undefined)

  const evmBalance = useCurrencyBalance(evmAccount, currency as Currency)

  if (isSolana && solanaBalance) {
    return {
      amount: solanaBalance.balance.div(10 ** currency.decimals).toString(),
      raw: solanaBalance.balance,
    }
  }
  if (evmBalance) {
    const amount = evmBalance.toExact?.() ?? '0'
    return {
      amount,
      raw: new BN(evmBalance.toExact()),
    }
  }
  return undefined
}
