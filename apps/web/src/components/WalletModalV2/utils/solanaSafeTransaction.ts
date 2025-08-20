import { Connection, Transaction, VersionedTransaction } from '@solana/web3.js'
import { WalletContextState } from '@solana/wallet-adapter-react'

/**
 * Safely send a transaction, handling both signAndSendTransaction and fallback methods
 */
export async function sendTransactionSafely(
  transaction: Transaction | VersionedTransaction,
  connection: Connection,
  wallet: WalletContextState,
): Promise<string> {
  const walletName = wallet.wallet?.adapter?.name || wallet.wallet?.name || ''

  // Check if wallet supports sendTransaction
  const supportsSignAndSend = typeof wallet.sendTransaction === 'function'

  // eslint-disable-next-line no-console
  console.log('📤 Sending transaction:', {
    walletName,
    supportsSignAndSend,
    transactionType: transaction instanceof VersionedTransaction ? 'VersionedTransaction' : 'Legacy Transaction',
  })

  try {
    // Try using sendTransaction (recommended method)
    if (supportsSignAndSend) {
      const signature = await wallet.sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      })

      // eslint-disable-next-line no-console
      console.log('✅ Transaction sent via sendTransaction:', signature)
      return signature
    }

    // Fallback: Manual sign and send
    if (!wallet.signTransaction) {
      throw new Error('Wallet does not support transaction signing')
    }

    // eslint-disable-next-line no-console
    console.log('⚠️ Using fallback: signTransaction + sendRawTransaction')

    const signed = await wallet.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    })

    // eslint-disable-next-line no-console
    console.log('✅ Transaction sent via fallback:', signature)
    return signature
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('❌ Transaction send error:', error)

    // Check for specific error types
    if (error?.message?.includes('signature verification')) {
      throw new Error('Transaction signature verification failed. Your wallet may not support this transaction type.')
    }

    throw error
  }
}
