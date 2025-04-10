import { DUNE_ENDPOINTS } from './endpoints'
import { fetchFromDune } from './request'
import { DuneResponse } from './types'

interface Row {
  Cake_burn: number
  name: string
  product_type: string
  week_start: string
}

/**
 * Mint Product Time Series
 */
export const getMintTimeSeries = async () => {
  const response = await fetchFromDune(DUNE_ENDPOINTS.MINT_TIME_SERIES)
  const data: DuneResponse<Row> = await response.json()

  const result = {
    timestamp: new Date(data.execution_ended_at).getTime(),
    data: data.result.rows
      .map((row: Row) => ({
        timestamp: new Date(row.week_start).getTime(),
        burn: row.Cake_burn,
        product: row.name,
      }))
      .slice()
      // Filter out timestamps that are in the future, and filter out misc products with name "Others"
      .filter((row) => row.timestamp < Date.now() && row.product !== 'Others')
      .sort((a, b) => a.timestamp - b.timestamp),
  }

  return result
}
