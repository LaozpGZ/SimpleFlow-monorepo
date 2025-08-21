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

  // For Trust Wallet, don't do pre-validation, just try to sign
  // This matches what swap does - just sign and send
  // eslint-disable-next-line no-console
  console.log('🔍 Signing transaction:', {
    walletName,
    transactionType: transaction.constructor.name,
    isLegacy: transaction instanceof Transaction,
    isVersioned: transaction instanceof VersionedTransaction,
  })

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
    // eslint-disable-next-line no-console
    console.error('❌ Sign/send error:', error)

    // Check for the specific serializeMessage error
    if (error?.message?.includes('serializeMessage is not a function')) {
      throw new Error(
        `${walletName} expects Legacy Transaction but received incompatible format. ` +
          'Trust Wallet may have compatibility issues with this transaction type. Please try using a different wallet like Phantom or Solflare.',
      )
    }

    // Check for Trust Wallet specific errors
    if (isTrustWallet) {
      if (error?.message?.includes('signature verification')) {
        throw new Error(
          'Trust Wallet signature verification failed. ' +
            'For imported accounts, please create a native Solana account in Trust Wallet instead.',
        )
      }

      // Generic Trust Wallet error
      throw new Error(
        `Trust Wallet transaction failed: ${error?.message || 'Unknown error'}. ` +
          'Trust Wallet may have compatibility issues with Solana transactions. Please try using Phantom or Solflare wallet.',
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

  // For Trust Wallet, ALWAYS use signTransaction + sendRawTransaction (like swap does)
  const forceSignAndRaw = isProblematic
  const supportsSignAndSend = typeof wallet.sendTransaction === 'function' && !forceSignAndRaw

  // eslint-disable-next-line no-console
  console.log('📤 Sending transaction:', {
    walletName,
    isProblematicWallet: isProblematic,
    forceSignAndRaw,
    supportsSignAndSend,
    transactionType: transaction instanceof VersionedTransaction ? 'VersionedTransaction' : 'Legacy Transaction',
  })

  try {
    // For Trust/SafePal, always use manual sign like swap does
    if (forceSignAndRaw) {
      // eslint-disable-next-line no-console
      console.log('⚠️ Using sign + send for problematic wallet')
      return await sendViaSignAndRaw(wallet, transaction, connection)
    }

    // Try using sendTransaction (recommended method) for other wallets
    if (supportsSignAndSend) {
      try {
        return await sendViaWalletAdapter(wallet, transaction, connection)
      } catch (sendError: any) {
        // If sendTransaction fails with "not support" error, fall through to manual sign
        if (sendError?.message?.includes('Not support') || sendError?.message?.includes('not support')) {
          // eslint-disable-next-line no-console
          console.log('⚠️ sendTransaction not supported, falling back to manual sign')
          return await sendViaSignAndRaw(wallet, transaction, connection)
        }
        throw sendError
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
