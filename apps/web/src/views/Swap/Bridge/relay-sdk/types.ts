// Base currency and amount types
export interface RelayCurrency {
  chainId: number
  address: string
  symbol: string
  name: string
  decimals: number
  metadata: {
    logoURI: string
    verified: boolean
    isNative: boolean
  }
}

export interface RelayAmount {
  currency: RelayCurrency
  amount: string
  amountFormatted: string
  amountUsd: string
  minimumAmount?: string
}

// Authorization list for EIP-7702
export interface RelayAuthorizationItem {
  chainId: number
  address: string
  nonce: number
  yParity: number
  r: string
  s: string
}

// Transaction data
export interface RelayTxData {
  to: string
  value: string
  data: string
}

// App fee structure
export interface RelayAppFee {
  recipient: string
  fee: string
}

// Quote request parameters
export interface RelayQuoteRequest {
  user: string
  recipient?: string
  originChainId: number
  destinationChainId: number
  originCurrency: string
  destinationCurrency: string
  amount: string
  tradeType: 'EXACT_INPUT' | 'EXACT_OUTPUT'
  txs?: RelayTxData[]
  txsGasLimit?: number
  authorizationList?: RelayAuthorizationItem[]
  additionalData?: {
    userPublicKey?: string
  }
  referrer?: string
  referrerAddress?: string
  refundTo?: string
  refundOnOrigin?: boolean
  topupGas?: boolean
  topupGasAmount?: string
  useReceiver?: boolean
  enableTrueExactOutput?: boolean
  protocolVersion?: 'v1' | 'v2'
  explicitDeposit?: boolean
  useExternalLiquidity?: boolean
  useFallbacks?: boolean
  usePermit?: boolean
  useDepositAddress?: boolean
  slippageTolerance?: string
  latePaymentSlippageTolerance?: string
  appFees?: RelayAppFee[]
  gasLimitForDepositSpecifiedTxs?: number
  forceSolverExecution?: boolean
  subsidizeFees?: boolean
  maxSubsidizationAmount?: string
  includedSwapSources?: string[]
  excludedSwapSources?: string[]
  includedOriginSwapSources?: string[]
  includedDestinationSwapSources?: string[]
  originGasOverhead?: number
  depositFeePayer?: string
}

// Step item data
export interface RelayStepItemData {
  from: string
  to: string
  data: string
  value: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  chainId: number
}

// Step item check
export interface RelayStepItemCheck {
  endpoint: string
  method: 'GET' | 'POST'
}

// Step item
export interface RelayStepItem {
  status: 'incomplete' | 'complete' | 'pending'
  data: RelayStepItemData
  check?: RelayStepItemCheck
}

// Step definition
export interface RelayStep {
  id: string
  action: string
  description: string
  kind: 'transaction' | 'signature'
  requestId?: string
  items: RelayStepItem[]
}

// Fee breakdown
export interface RelayFees {
  gas: RelayAmount
  relayer: RelayAmount
  relayerGas: RelayAmount
  relayerService: RelayAmount
  app: RelayAmount
  subsidized: RelayAmount
}

// Slippage tolerance details
export interface RelaySlippageTolerance {
  origin: {
    usd: string
    value: string
    percent: string
  }
  destination: {
    usd: string
    value: string
    percent: string
  }
}

// Price impact breakdown
export interface RelayExpandedPriceImpact {
  swap: {
    usd: string
  }
  execution: {
    usd: string
  }
  relay: {
    usd: string
  }
  app: {
    usd: string
  }
}

// Quote details
export interface RelayDetails {
  operation: string
  sender: string
  recipient: string
  currencyIn: RelayAmount
  currencyOut: RelayAmount
  currencyGasTopup: RelayAmount
  totalImpact: {
    usd: string
    percent: string
  }
  swapImpact: {
    usd: string
    percent: string
  }
  expandedPriceImpact: RelayExpandedPriceImpact
  rate: string
  slippageTolerance: RelaySlippageTolerance
  timeEstimate: number
  userBalance: string
  fallbackType: string
}

// Protocol specific data
export interface RelayProtocolV2 {
  orderId: string
  paymentDetails: {
    chainId: string
    depository: string
    currency: string
    amount: string
  }
}

export interface RelayProtocol {
  v2?: RelayProtocolV2
}

// Main quote response
export interface RelayQuoteResponse {
  steps: RelayStep[]
  fees: RelayFees
  details: RelayDetails
  protocol?: RelayProtocol
}

// Error response
export interface RelayError {
  message: string
  code?: string
  details?: any
}

export interface RelayErrorResponse {
  error: RelayError
}

// Trade type enum
export type RelayTradeType = 'EXACT_INPUT' | 'EXACT_OUTPUT'

// Bridge adapter types - target format
export interface BridgeTransactionData {
  outputAmount: string
  fillDeadline: number
  totalFeePct: string
  totalFee: string
  totalImpactPct: string
}

export interface BridgeAdapterResponse {
  supported: boolean
  requestId?: string
  amount: string
  inputToken: string
  originChainId: number
  outputToken: string
  destinationChainId: number
  expectedFillTimeSec: string
  isAmountTooLow: boolean
  rate: string
  bridgeTransactionData: BridgeTransactionData
  error?: {
    code: string
    message: string
    description?: string
  }
  reason?: string
}
