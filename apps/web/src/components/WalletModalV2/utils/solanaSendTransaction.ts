import {
  Connection,
  PublicKey,
  Transaction,
  TransactionMessage,
  TransactionInstruction,
  VersionedTransaction,
  SystemProgram,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import {
  createTransferInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token'

export interface SolanaSendParams {
  connection: Connection
  fromPubkey: PublicKey
  toPubkey: PublicKey
  amount: number
  isNativeToken: boolean
  tokenMint?: PublicKey
  tokenDecimals?: number
  tokenProgramId?: PublicKey
  computeBudgetConfig: {
    units: number
    microLamports: number
  }
  walletSupportsV0?: boolean
}

/**
 * Creates a Solana transaction for sending assets
 * Automatically detects and uses the appropriate transaction version
 */
export async function createSolanaSendTransaction(
  params: SolanaSendParams,
): Promise<Transaction | VersionedTransaction> {
  const {
    connection,
    fromPubkey,
    toPubkey,
    amount,
    isNativeToken,
    tokenMint,
    tokenDecimals,
    tokenProgramId = TOKEN_PROGRAM_ID,
    computeBudgetConfig,
    walletSupportsV0 = false,
  } = params

  const instructions: TransactionInstruction[] = []

  // Add compute budget instructions
  instructions.push(
    ComputeBudgetProgram.setComputeUnitLimit({ units: computeBudgetConfig.units }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: computeBudgetConfig.microLamports }),
  )

  if (isNativeToken) {
    // Native SOL transfer
    const amountInLamports = Math.floor(amount * LAMPORTS_PER_SOL)
    instructions.push(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: amountInLamports,
      }),
    )
  } else {
    // Token transfer
    if (!tokenMint || tokenDecimals === undefined) {
      throw new Error('Token mint and decimals are required for token transfers')
    }

    const amountInTokenUnits = Math.floor(amount * 10 ** tokenDecimals)

    // Get associated token accounts
    const senderTokenAccount = await getAssociatedTokenAddress(tokenMint, fromPubkey, false, tokenProgramId)

    const recipientTokenAccount = await getAssociatedTokenAddress(tokenMint, toPubkey, false, tokenProgramId)

    // Check if recipient's token account exists
    try {
      await getAccount(connection, recipientTokenAccount, 'confirmed', tokenProgramId)
    } catch (error: any) {
      if (error.name === 'TokenAccountNotFoundError') {
        // Create associated token account for recipient
        instructions.push(
          createAssociatedTokenAccountInstruction(
            fromPubkey, // payer
            recipientTokenAccount, // ata
            toPubkey, // owner
            tokenMint, // mint
            tokenProgramId,
          ),
        )
      } else {
        throw error
      }
    }

    // Add transfer instruction
    if (tokenProgramId.equals(TOKEN_2022_PROGRAM_ID)) {
      instructions.push(
        createTransferCheckedInstruction(
          senderTokenAccount,
          tokenMint,
          recipientTokenAccount,
          fromPubkey,
          amountInTokenUnits,
          tokenDecimals,
          [],
          tokenProgramId,
        ),
      )
    } else {
      instructions.push(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          fromPubkey,
          amountInTokenUnits,
          [],
          tokenProgramId,
        ),
      )
    }
  }

  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

  // Create transaction based on wallet support
  if (walletSupportsV0) {
    // eslint-disable-next-line no-console
    console.log('🚀 Creating v0 transaction')
    // Create v0 transaction
    const messageV0 = new TransactionMessage({
      payerKey: fromPubkey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message()

    return new VersionedTransaction(messageV0)
  }

  // eslint-disable-next-line no-console
  console.log('📦 Creating legacy transaction')
  // Create legacy transaction
  const transaction = new Transaction()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = fromPubkey
  transaction.lastValidBlockHeight = lastValidBlockHeight
  instructions.forEach((ix) => transaction.add(ix))

  return transaction
}

/**
 * Detects wallet transaction version support
 */
export function detectWalletTransactionSupport(wallet: any): boolean {
  // Check if wallet supports v0 transactions
  const supportsV0 =
    wallet?.adapter?.supportedTransactionVersions?.has('v0') ||
    wallet?.adapter?.supportedTransactionVersions?.has(0) ||
    wallet?.features?.['solana:signAndSendTransaction']?.supportedTransactionVersions?.includes('v0') ||
    wallet?.features?.['solana:signTransaction']?.supportedTransactionVersions?.includes('v0')

  console.log('🔍 Wallet transaction support detection:', {
    walletName: wallet?.adapter?.name || wallet?.name,
    supportsV0,
    supportedVersions: wallet?.adapter?.supportedTransactionVersions,
    features: wallet?.features,
  })

  return supportsV0
}
