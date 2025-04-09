import { DUNE_ENDPOINTS } from './endpoints'
import { fetchFromDune } from './request'
import { DuneResponse } from './types'

interface Row {
  actualmint: number
  blocks: number
  burn: number
  net_mint: number
  week: string
}

export const getDeflationTimeSeries = async () => {
  const response = await fetchFromDune(DUNE_ENDPOINTS.DEFLATION_TIME_SERIES)
  const data: DuneResponse<Row> = await response.json()

  const result = {
    timestamp: new Date(data.execution_ended_at).getTime(),
    data: data.result.rows
      .map((row: Row) => ({
        timestamp: new Date(row.week).getTime(),

        // Negative of net mint to show positive deflation
        deflation: -row.net_mint,
      }))
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp),
  }

  return result
}
