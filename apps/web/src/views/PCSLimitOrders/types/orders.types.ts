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

interface ResponseOrder {
  order_id: string
  owner: string
  liquidity: string
  status: OrderStatus
  updated_at: string
  zero_for_one: boolean
  tick_lower: number
}

export enum OrderStatus {
  Open = 'Open',
  Filled = 'Filled',
  PartiallyFilled = 'PartiallyFilled',
  Cancelled = 'Cancelled',
  Withdrawn = 'Withdrawn',
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
