import { ChainId } from '@pancakeswap/chains'
import { getPredictionConfig } from '@pancakeswap/prediction'
import { fetchPredictionUsers } from 'state/predictions'

export async function queryPredictionUser() {
  const config = await getPredictionConfig(ChainId.BSC)
  const extra = config?.BNB ?? Object.values(config)?.[0]
  const result = await fetchPredictionUsers(
    {
      address: null,
      orderBy: 'totalBets',
      timePeriod: 'all',
    },
    extra,
  )
  return result.results.slice(0, 1)
}
