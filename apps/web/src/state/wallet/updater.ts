import { ChainId, NonEVMChainId, UnifiedChainId } from '@pancakeswap/chains'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import useAddressBalance from 'hooks/useAddressBalance'
import { useEffect } from 'react'
import { TransactionDetails } from 'state/transactions/reducer'

export const WALLET_TRX_EVENT_NAME = 'pcs:transaction-success'

interface WalletTransactionEvent
  extends CustomEvent<{
    chainId: UnifiedChainId
    transaction: Partial<Pick<TransactionDetails, 'outputChainId' | 'type'>>
  }> {}

export function createWalletTransactionEvent(
  chainId: UnifiedChainId,
  transaction: WalletTransactionEvent['detail']['transaction'],
): WalletTransactionEvent {
  return new CustomEvent(WALLET_TRX_EVENT_NAME, {
    detail: {
      chainId,
      transaction,
    },
  })
}

export const WalletBalanceUpdater: React.FC = () => {
  const { account, solanaAccount } = useAccountActiveChain()

  // Use BSC just to fetch EVM balances
  const { balances: evmBalances, refresh: refreshEvmBalances } = useAddressBalance(account, ChainId.BSC, {
    enabled: false,
  })
  const { balances: solanaBalances, refresh: refreshSolanaBalances } = useAddressBalance(
    solanaAccount,
    NonEVMChainId.SOLANA,
    { enabled: false },
  )

  useEffect(() => {
    const handleWalletTransaction = (event: WalletTransactionEvent) => {
      const { transaction, chainId } = event.detail
      if (!transaction?.type || !chainId) return

      const delay = 15000

      switch (transaction.type) {
        case 'bridge': {
          const isToSolana = transaction.outputChainId === NonEVMChainId.SOLANA

          if (chainId !== NonEVMChainId.SOLANA && evmBalances) {
            setTimeout(() => {
              refreshEvmBalances()
            }, delay)
          }

          if (isToSolana && solanaBalances) {
            setTimeout(() => {
              refreshSolanaBalances()
            }, delay)
          }
          break
        }

        case 'swap':
        case 'wrap':
        case 'remove-liquidity-infinity-bin':
        case 'remove-liquidity-infinity-cl':
        case 'remove-liquidity-v3':
        case 'collect-fee':
        case 'remove-liquidity':
        case 'limit-order-cancellation':
        case 'cross-chain-farm':
        case 'claim-liquid-staking':
        case 'place-limit-order':
        case 'other': {
          if (chainId !== NonEVMChainId.SOLANA && evmBalances) {
            setTimeout(() => {
              refreshEvmBalances()
            }, delay)
          }
          if (chainId === NonEVMChainId.SOLANA && solanaBalances) {
            setTimeout(() => {
              refreshSolanaBalances()
            }, delay)
          }
          break
        }

        default:
          break
      }
    }

    window.addEventListener(WALLET_TRX_EVENT_NAME, handleWalletTransaction as EventListener)
    return () => window.removeEventListener(WALLET_TRX_EVENT_NAME, handleWalletTransaction as EventListener)
  }, [refreshEvmBalances, refreshSolanaBalances, evmBalances, solanaBalances])

  return null
}
