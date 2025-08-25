import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { BridgeTransactionData } from '@pancakeswap/price-api-sdk'
import { RelayQuoteResponse, BridgeAdapterResponse } from './types'

// NOTE: because of setModalNode(modal), we can't use TransactionInstruction here
// the modal logic can't parse TransactionInstruction type using JSON.stringify
// temporary solution is keep JSON type and parse it when modal is open
export function convertStepsIntoTransactionInstruction(instructions: any[]): TransactionInstruction[] {
  return instructions.map((instruction) => {
    return new TransactionInstruction({
      keys: instruction.keys.map((key: any) => {
        return {
          pubkey: new PublicKey(key.pubkey),
          isSigner: key.isSigner,
          isWritable: key.isWritable,
        }
      }),
      programId: new PublicKey(instruction.programId),
      data: Buffer.from(instruction.data, 'hex'),
    })
  })
}

/**
 * Converts a Relay API quote response to the expected bridge format
 */
export function adaptRelayQuoteToBridge(relayResponse: RelayQuoteResponse): BridgeAdapterResponse {
  try {
    // Extract the first transaction step to get request ID
    const firstStep = relayResponse.steps?.[0]
    const requestId = firstStep?.requestId

    // Calculate rate from input/output amounts
    const inputAmount = relayResponse.details.currencyIn.amount
    const outputAmount = relayResponse.details.currencyOut.amount
    const rate = calculateRate(inputAmount, outputAmount)

    // Calculate total fee percentage and amount
    const totalFeeAmount = calculateTotalFeeAmount(relayResponse)
    const totalFeePct = calculateTotalFeePercentage(inputAmount, totalFeeAmount)

    // Calculate total impact percentage
    const totalImpactPct = relayResponse.details.totalImpact.percent

    // Calculate fill deadline (current time + estimated time + buffer)
    const currentTime = Math.floor(Date.now() / 1000)
    const estimatedTime = relayResponse.details.timeEstimate || 60 // default 60 seconds
    const fillDeadline = currentTime + estimatedTime + 300 // add 5 minute buffer

    // Check if amount is too low (based on input amount)
    const isAmountTooLow = parseFloat(inputAmount) < 1000 // example threshold

    // TODO: add type
    const instructions = relayResponse?.steps?.[0]?.items?.[0]?.data?.instructions || []

    const addressLookupTableAddresses = relayResponse?.steps?.[0]?.items?.[0]?.data?.addressLookupTableAddresses

    const bridgeTransactionData: BridgeTransactionData = {
      // placeholder for missing fields
      exclusiveRelayer: '',
      exclusivityDeadline: 0,
      quoteTimestamp: 0,
      outputAmount,
      fillDeadline,
      relayerFeePct: totalFeePct,
      totalRelayFee: totalFeeAmount,
      totalImpactPct,
      addressLookupTableAddresses,
      steps:
        instructions?.length > 0
          ? instructions
          : [
              {
                to: relayResponse.steps?.[0]?.items?.[0]?.data.to || '',
                calldata: relayResponse.steps?.[0]?.items?.[0]?.data.data || '',
              },
            ],
    }

    return {
      supported: true,
      requestId,
      amount: inputAmount,
      inputToken: relayResponse.details.currencyIn.currency.address,
      originChainId: relayResponse.details.currencyIn.currency.chainId,
      outputToken: relayResponse.details.currencyOut.currency.address,
      destinationChainId: relayResponse.details.currencyOut.currency.chainId,
      expectedFillTimeSec: estimatedTime.toString(),
      isAmountTooLow,
      rate,
      bridgeTransactionData,
    }
  } catch (error) {
    console.error('Error adapting Relay quote to bridge format:', error)

    return {
      supported: false,
      amount: '0',
      inputToken: '0x0000000000000000000000000000000000000000',
      originChainId: 1,
      outputToken: '0x0000000000000000000000000000000000000000',
      destinationChainId: 1,
      expectedFillTimeSec: '0',
      isAmountTooLow: false,
      rate: '0',
      bridgeTransactionData: {
        exclusiveRelayer: '',
        exclusivityDeadline: 0,
        quoteTimestamp: 0,
        outputAmount: '0',
        fillDeadline: 0,
        totalRelayFee: '0',
        relayerFeePct: '0',
        totalImpactPct: '0',
      },
      error: {
        code: 'ADAPTER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to adapt relay response',
      },
    }
  }
}

/**
 * Calculate the exchange rate between input and output amounts
 */
function calculateRate(inputAmount: string, outputAmount: string): string {
  try {
    const input = parseFloat(inputAmount)
    const output = parseFloat(outputAmount)

    if (input === 0) return '0'

    const rate = output / input
    return rate.toString()
  } catch {
    return '0'
  }
}

/**
 * Calculate total fee amount from all fee components
 */
function calculateTotalFeeAmount(relayResponse: RelayQuoteResponse): string {
  try {
    const { fees } = relayResponse
    const gasAmount = parseFloat(fees.gas.amount || '0')
    const relayerAmount = parseFloat(fees.relayer.amount || '0')
    const serviceAmount = parseFloat(fees.relayerService.amount || '0')
    const appAmount = parseFloat(fees.app.amount || '0')

    const totalFee = gasAmount + relayerAmount + serviceAmount + appAmount
    return Math.floor(totalFee).toString()
  } catch {
    return '0'
  }
}

/**
 * Calculate total fee percentage relative to input amount
 */
function calculateTotalFeePercentage(inputAmount: string, totalFeeAmount: string): string {
  try {
    const input = parseFloat(inputAmount)
    const fee = parseFloat(totalFeeAmount)

    if (input === 0) return '0'

    // Convert to basis points (percentage * 10000)
    const percentage = (fee / input) * 100
    const basisPoints = percentage * 10000
    return Math.floor(basisPoints).toString()
  } catch {
    return '0'
  }
}
