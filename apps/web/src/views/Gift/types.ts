import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/swap-sdk-core'
import { WrappedTokenInfo } from '@pancakeswap/token-lists'

export enum GiftStatus {
  PENDING = 'PENDING',
  CLAIMED = 'CLAIMED',
  EXPIRED = 'EXPIRED',
  REQUESTED_CLAIM = 'REQUESTED_CLAIM',
  CANCELLED = 'CANCELLED',
}

export interface GiftInfoResponse {
  codeHash: string
  token: string
  tokenAmount: string
  nativeAmount: string
  createTransactionHash: string
  status: GiftStatus
  claimerAddress: string | null
  actionTransactionHash: string | null // the transaction for CLAIMED/EXPIRED/CANCELLED
  timestamp: string // ISOString
}

export interface GiftInfo extends Omit<GiftInfoResponse, 'tokenAmount' | 'nativeAmount'> {
  tokenInfo: WrappedTokenInfo
  tokenAmount: CurrencyAmount<Token>
  nativeAmount: CurrencyAmount<NativeCurrency>
  nativePrice: number
  tokenPrice: number
}

export enum GiftApiStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface GiftApiResponse<T> {
  status: GiftApiStatus
  message?: string // if status is failed
  data?: T
}

export interface ClaimGiftRequest {
  chainId: number
  address: string
  code: string
}

export interface ClaimGiftResponse {
  status: GiftApiStatus
  message?: string
  codeHash: string
}

export interface ClaimGiftParams {
  code: string
}
