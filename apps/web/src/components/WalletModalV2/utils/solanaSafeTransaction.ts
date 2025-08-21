import { Connection, Transaction, VersionedTransaction } from '@solana/web3.js'
import { WalletContextState } from '@solana/wallet-adapter-react'

/**
 * Check if wallet is known to have issues with standard transaction sending
 */
function isProblematicWallet(walletName: string): boolean {
  const problematicWallets = ['SafePal', 'Trust Wallet', 'Trust']
  return problematicWallets.some((name) => walletName.toLowerCase().includes(name.toLowerCase()))
}

/**
 * Check if a transaction is a Legacy Transaction
 */
function isLegacyTx(tx: any): tx is Transaction {
  // Check for Transaction class and serializeMessage method
  return (
    tx instanceof Transaction && typeof tx?.serializeMessage === 'function' && !(tx instanceof VersionedTransaction)
  )
}

/**
 * Send transaction using wallet.sendTransaction method
 */
async function sendViaWalletAdapter(
  wallet: WalletContextState,
  transaction: Transaction | VersionedTransaction,
  connection: Connection,
): Promise<string> {
  const signature = await wallet.sendTransaction(transaction, connection, {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  })

  // eslint-disable-next-line no-console
  console.log('✅ Transaction sent via sendTransaction:', signature)
  return signature
}

/**
 * Send transaction using manual sign and send (fallback method)
 */
async function sendViaSignAndRaw(
  wallet: WalletContextState,
  transaction: Transaction | VersionedTransaction,
  connection: Connection,
): Promise<string> {
  if (!wallet.signTransaction) {
    throw new Error('Wallet does not support transaction signing')
  }

  // eslint-disable-next-line no-console
  console.log('⚠️ Using fallback: signTransaction + sendRawTransaction')

  // Check if this is Trust Wallet
  const walletName = wallet.wallet?.adapter?.name || ''
  const isTrustWallet = walletName.toLowerCase().includes('trust')

  // Pre-signing validation for Trust Wallet
  // eslint-disable-next-line no-console
  console.log('🔍 Transaction validation for Trust Wallet:', {
    walletName,
    transactionType: transaction.constructor.name,
    isTransaction: transaction instanceof Transaction,
    isVersionedTransaction: transaction instanceof VersionedTransaction,
    hasSerializeMessage: typeof (transaction as any).serializeMessage === 'function',
    isLegacyTx: isLegacyTx(transaction),
  })

  if (isTrustWallet && !isLegacyTx(transaction)) {
    // eslint-disable-next-line no-console
    console.error('❌ Trust Wallet requires Legacy Transaction, got:', {
      type: transaction.constructor.name,
      isTransaction: transaction instanceof Transaction,
      hasSerializeMessage: typeof (transaction as any).serializeMessage === 'function',
    })
    throw new Error(
      `${walletName} requires a Legacy Transaction; got ${transaction.constructor.name}. ` +
        'This indicates a transaction format mismatch. Please try with a different wallet or contact support.',
    )
  }

  try {
    const signed = await wallet.signTransaction(transaction)
    const serializedTx = signed.serialize()

    const signature = await connection.sendRawTransaction(serializedTx, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    })

    // eslint-disable-next-line no-console
    console.log('✅ Transaction sent via fallback:', signature)
    return signature
  } catch (error: any) {
    // Check for the specific serializeMessage error
    if (error?.message?.includes('serializeMessage is not a function')) {
      throw new Error(
        `${walletName} expects Legacy Transaction but received incompatible format. ` +
          'This is a transaction format mismatch issue. Please try with a different wallet.',
      )
    }

    // Special handling for Trust Wallet imported accounts
    if (isTrustWallet && error?.message?.includes('signature verification')) {
      // eslint-disable-next-line no-console
      console.error('❌ Trust Wallet imported account signature issue detected')
      throw new Error(
        'Trust Wallet imported account detected. ' +
          'This account cannot send transactions due to key mismatch. ' +
          'Please use a native Solana account created in Trust Wallet, or import using a Solana private key instead.',
      )
    }

    throw error
  }
}

/**
 * Safely send a transaction, handling both signAndSendTransaction and fallback methods
 */
export async function sendTransactionSafely(
  transaction: Transaction | VersionedTransaction,
  connection: Connection,
  wallet: WalletContextState,
): Promise<string> {
  const walletName = wallet.wallet?.adapter?.name || ''
  const isProblematic = isProblematicWallet(walletName)
  const supportsSignAndSend = typeof wallet.sendTransaction === 'function' && !isProblematic

  // eslint-disable-next-line no-console
  console.log('📤 Sending transaction:', {
    walletName,
    isProblematicWallet: isProblematic,
    supportsSignAndSend,
    transactionType: transaction instanceof VersionedTransaction ? 'VersionedTransaction' : 'Legacy Transaction',
  })

  try {
    // Try using sendTransaction (recommended method) - but not for problematic wallets
    if (supportsSignAndSend) {
      try {
        return await sendViaWalletAdapter(wallet, transaction, connection)
      } catch (sendError: any) {
        // If sendTransaction fails with "not support" error, fall through to manual sign
        if (sendError?.message?.includes('Not support') || sendError?.message?.includes('not support')) {
          // eslint-disable-next-line no-console
          console.log('⚠️ sendTransaction not supported, falling back to manual sign')
        } else {
          throw sendError
        }
      }
    }

    // Fallback: Manual sign and send
    return await sendViaSignAndRaw(wallet, transaction, connection)
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('❌ Transaction send error:', error)

    // Check for specific error types and provide helpful messages
    if (error?.message?.includes('Trust Wallet imported account')) {
      // Already has a helpful message from our detection
      throw error
    }

    if (error?.message?.includes('signature verification') || error?.message?.includes('Invalid signature')) {
      const walletName = wallet.wallet?.adapter?.name || ''
      const isTrustWallet = walletName.toLowerCase().includes('trust')

      if (isTrustWallet) {
        throw new Error(
          'Trust Wallet signature error detected. ' +
            'For imported accounts, please create a native Solana account in Trust Wallet instead.',
        )
      }

      throw new Error(
        'Transaction signature verification failed. ' +
          'This may occur with imported accounts. Please try using a native wallet account.',
      )
    }

    throw error
  }
}
