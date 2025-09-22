import { CLPoolInfo } from 'state/farmsV4/state/accountPositions/fetcher/infinity/getPoolInfo'

export interface OrderHistoryResponse {
  startCursor: string
  endCursor: string
  hasNextPage: boolean
  rows: ResponseOrder[]
}

export interface PaginationInfo {
  startCursor: string
  endCursor: string
  hasNextPage: boolean
}

export interface PaginationParams {
  before?: string
  after?: string
}

export interface ResponseOrder {
  order_id: string
  pool_id: string
  owner: string
  liquidity: string
  status: OrderStatus
  updated_at: string
  zero_for_one: boolean
  tick_lower: number
  transaction_hash: string

  pool?: CLPoolInfo // TODO: separate to proper type
}

export enum OrderStatus {
  Open = 'Open',
  Filled = 'Filled',
  PartiallyFilled = 'Partially_Filled',
  Cancelled = 'Cancelled',
  Withdrawn = 'Withdrawn',
}

export enum ContractOrderStatus {
  Open,
  Pending,
  Filled,
}

export interface Order {
  sell: any
  buy: any
  limitPrice: any
  status: OrderStatus
  filled: number
  amountReceived: any

  // figure out later
  actions?: any
}
