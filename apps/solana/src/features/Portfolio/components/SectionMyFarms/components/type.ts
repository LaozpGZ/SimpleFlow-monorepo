import { ApiV3Token } from '@simpleflow/solana-core-sdk'

export type RewardInfo = {
  weekly: string
  periodString: string
  periodDays: number
  unEmit: string
  mint: ApiV3Token
}
