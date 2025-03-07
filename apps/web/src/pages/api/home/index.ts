import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'
import { NextApiHandler } from 'next'
import { homePageChainsInfo, homePageCurrencies, partners } from './homePageDataQuery'
import { queryPools } from './queries/queryPools'
import { queryPredictionUser } from './queries/queryPrediction'
import { queryTokens } from './queries/queryTokens'
import { queryCakeRelated } from './queryCakeRelated'
import { querySiteStats } from './querySiteStats'
import { HomePageData } from './types'

async function _load() {
  const [tokens, pools, cakeRelated, stats, predictionUsers] = await Promise.all([
    queryTokens(),
    queryPools(),
    queryCakeRelated(),
    querySiteStats(),
    queryPredictionUser(),
  ])
  const currencies = homePageCurrencies
  const chains = homePageChainsInfo()
  return {
    tokens,
    pools,
    currencies,
    chains,
    cakeRelated,
    stats,
    partners,
    predictionUsers,
  } as HomePageData
}
export const loadHomePageData = cacheByLRU(_load, {
  ttl: 3600 * 24 * 1000,
})

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=60, max-age=30, stale-while-revalidate=300')
  const data = await loadHomePageData()
  return res.status(200).json(data)
}

export default handler
