export interface ResponseOrder {
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
