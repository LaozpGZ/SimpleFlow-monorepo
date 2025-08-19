import {
  Connection,
  PublicKey,
  SystemProgram,
  ComputeBudgetProgram,
  VersionedTransaction,
  TransactionMessage,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TokenAccountNotFoundError,
  ACCOUNT_SIZE,
} from '@solana/spl-token'
import { formatUnits } from 'viem'

interface SolanaFeeEstimationParams {
  connection: Connection
  solanaPublicKey: PublicKey
  recipientAddress: string
  amount: string
  isNativeToken: boolean
  tokenInfo?: {
    address: string
    decimals: number
  }
}

interface FeeBreakdown {
  baseFee: bigint
  priorityFee: bigint
  ataRent: bigint
  totalFee: bigint
  formattedFee: string
}

/**
 * Estimate Solana transaction fees with proper breakdown
 * Includes base fee, priority fee, and ATA rent (if needed)
 */
export async function estimateSolanaTransactionFee({
  connection,
  solanaPublicKey,
  recipientAddress,
  amount,
  isNativeToken,
  tokenInfo,
}: SolanaFeeEstimationParams): Promise<FeeBreakdown> {
  const recipientPubkey = new PublicKey(recipientAddress)

  let baseFee = 5000n // base signature fee in lamports
  let priorityFee = 0n
  let ataRent = 0n

  // Build the transaction to estimate fees
  const instructions: TransactionInstruction[] = []

  if (isNativeToken) {
    // Convert amount properly using BigInt to avoid precision issues
    const amountBigInt = BigInt(Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL))

    // SOL transfer
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: solanaPublicKey,
        toPubkey: recipientPubkey,
        lamports: Number(amountBigInt),
      }),
    )
  } else {
    if (!tokenInfo) throw new Error('Token info required for token transfers')

    // Token transfer
    const tokenMintAddress = new PublicKey(tokenInfo.address)

    // Detect token program
    let tokenProgramId = TOKEN_PROGRAM_ID
    try {
      const mintInfo = await connection.getAccountInfo(tokenMintAddress)
      if (mintInfo?.owner.equals(TOKEN_2022_PROGRAM_ID)) {
        tokenProgramId = TOKEN_2022_PROGRAM_ID
        console.log('Detected Token2022 mint for fee estimation')
      }
    } catch (error) {
      console.log('Failed to detect token program for fee estimation, using default TOKEN_PROGRAM_ID')
    }

    const recipientTokenAccount = await getAssociatedTokenAddress(
      tokenMintAddress,
      recipientPubkey,
      false,
      tokenProgramId,
    )

    // Check if recipient token account exists
    try {
      await getAccount(connection, recipientTokenAccount, 'confirmed', tokenProgramId)
      console.log('Recipient token account exists, no ATA creation needed')
    } catch (error: any) {
      if (error instanceof TokenAccountNotFoundError) {
        console.log('Recipient token account does not exist, ATA creation required')
        // Get actual rent exemption amount instead of hardcoded value
        ataRent = BigInt(await connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE))
        console.log('ATA rent requirement:', formatUnits(ataRent, 9), 'SOL')

        // Add ATA creation instruction
        instructions.push(
          createAssociatedTokenAccountInstruction(
            solanaPublicKey,
            recipientTokenAccount,
            recipientPubkey,
            tokenMintAddress,
            tokenProgramId,
          ),
        )
      } else {
        console.log('Error checking recipient token account:', error)
      }
    }

    // Add token transfer instruction
    const senderTokenAccount = await getAssociatedTokenAddress(tokenMintAddress, solanaPublicKey, false, tokenProgramId)

    // Use token amount with proper BigInt precision to avoid floating point issues
    const decimalMultiplier = BigInt(10 ** tokenInfo.decimals)
    const amountFloat = parseFloat(amount)
    const tokenAmount = BigInt(Math.floor(amountFloat * Number(decimalMultiplier)))

    if (tokenProgramId === TOKEN_2022_PROGRAM_ID) {
      instructions.push(
        createTransferCheckedInstruction(
          senderTokenAccount,
          tokenMintAddress,
          recipientTokenAccount,
          solanaPublicKey,
          Number(tokenAmount),
          tokenInfo.decimals,
          [],
          tokenProgramId,
        ),
      )
    } else {
      instructions.push(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          solanaPublicKey,
          Number(tokenAmount),
          [],
          tokenProgramId,
        ),
      )
    }
  }

  // First, get dynamic priority fee from RPC
  let computeUnitPrice = 1000 // fallback value
  try {
    // Try to get recent prioritization fees
    const recentFees = await connection.getRecentPrioritizationFees()
    if (recentFees && recentFees.length > 0) {
      // Use the 90th percentile for more reliable transaction processing
      const fees = recentFees.map((f) => f.prioritizationFee).sort((a, b) => a - b)
      const percentile90Index = Math.floor(fees.length * 0.9)
      computeUnitPrice = Math.max(fees[percentile90Index] || 1000, 1000) // minimum 1000
      console.log(`Using dynamic priority fee: ${computeUnitPrice} μ-lamports/CU`)
    }
  } catch (error) {
    console.log('Failed to get recent prioritization fees, using fallback:', computeUnitPrice)
  }

  // Add compute budget instructions for priority fee
  instructions.unshift(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: computeUnitPrice,
    }),
  )

  // Create transaction and estimate fees
  try {
    const { blockhash } = await connection.getLatestBlockhash()
    const messageV0 = new TransactionMessage({
      payerKey: solanaPublicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message()

    // Get base fee from message
    const feeResponse = await connection.getFeeForMessage(messageV0)
    if (feeResponse.value) {
      baseFee = BigInt(feeResponse.value)
      console.log('Base fee from getFeeForMessage:', formatUnits(baseFee, 9), 'SOL')
    }

    // Simulate transaction to get compute units and priority fee
    const vtx = new VersionedTransaction(messageV0)
    const simulation = await connection.simulateTransaction(vtx, {
      replaceRecentBlockhash: true,
      sigVerify: false,
    })

    if (simulation.value.err) {
      console.warn('Transaction simulation failed:', simulation.value.err)
    }

    if (simulation.value.unitsConsumed) {
      // Calculate priority fee: compute units * micro-lamports per unit / 1,000,000
      priorityFee = BigInt(Math.ceil((simulation.value.unitsConsumed * computeUnitPrice) / 1000000))
      console.log('Compute units consumed:', simulation.value.unitsConsumed)
      console.log('Priority fee calculated:', formatUnits(priorityFee, 9), 'SOL')

      // Add compute unit limit for better fee estimation (add 10% buffer)
      const computeUnitLimit = Math.ceil(simulation.value.unitsConsumed * 1.1)
      instructions.unshift(
        ComputeBudgetProgram.setComputeUnitLimit({
          units: computeUnitLimit,
        }),
      )
      console.log('Setting compute unit limit:', computeUnitLimit)

      // Recreate transaction with compute unit limit for final fee calculation
      const finalMessageV0 = new TransactionMessage({
        payerKey: solanaPublicKey,
        recentBlockhash: blockhash,
        instructions,
      }).compileToV0Message()

      const finalFeeResponse = await connection.getFeeForMessage(finalMessageV0)
      if (finalFeeResponse.value) {
        baseFee = BigInt(finalFeeResponse.value)
        console.log('Final base fee with compute limit:', formatUnits(baseFee, 9), 'SOL')
      }
    }
  } catch (error) {
    console.error('Failed to simulate transaction for fee estimation:', error)
    // Use fallback values
    baseFee = 5000n
    priorityFee = 1000n // small default priority fee
    console.log('Using fallback fee values')
  }

  // Total fee = base fee + priority fee + ATA rent (if needed)
  const totalFee = baseFee + priorityFee + ataRent
  const formattedFee = formatUnits(totalFee, 9) // SOL has 9 decimals

  const breakdown = {
    baseFee,
    priorityFee,
    ataRent,
    totalFee,
    formattedFee,
  }

  console.log('📊 Solana Fee Breakdown:', {
    baseFee: `${formatUnits(baseFee, 9)} SOL`,
    priorityFee: `${formatUnits(priorityFee, 9)} SOL`,
    ataRent: ataRent > 0n ? `${formatUnits(ataRent, 9)} SOL` : '0 SOL (no ATA needed)',
    totalFee: `${formattedFee} SOL`,
  })

  return breakdown
}

/**
 * Simplified fee estimation for quick estimates
 */
export async function estimateSolanaFeeQuick(
  connection: Connection,
  needsATACreation: boolean = false,
): Promise<string> {
  let totalFee = 5000n // base fee
  totalFee += 1000n // small priority fee

  if (needsATACreation) {
    const ataRent = BigInt(await connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE))
    totalFee += ataRent
  }

  return formatUnits(totalFee, 9)
}
