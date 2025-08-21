import { RelayQuoteResponse, BridgeAdapterResponse, BridgeTransactionData } from './types'

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

    const bridgeTransactionData: BridgeTransactionData = {
      outputAmount,
      fillDeadline,
      totalFeePct,
      totalFee: totalFeeAmount,
      totalImpactPct,
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
        outputAmount: '0',
        fillDeadline: 0,
        totalFeePct: '0',
        totalFee: '0',
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
