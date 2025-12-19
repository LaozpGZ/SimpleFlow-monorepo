import { cacheByLRU, getR2Cache, uploadR2 } from '@pancakeswap/utils/cacheByLRU'
import { NextApiHandler } from 'next'
import { homePageChainsInfo, homePageCurrencies, partners } from 'edge/home/homePageDataQuery'
import { queryPools } from 'edge/home/queries/queryPools'
import { queryPredictionUser } from 'edge/home/queries/queryPrediction'
import { queryTokens } from 'edge/home/queries/queryTokens'
import { querySiteStats } from 'edge/home/querySiteStats'
import { isHomePageDataValid } from 'edge/home/isHomePageDataValid'
import { HomePageData } from 'edge/home/types'

const CACHE_KEY = 'home-page-data'
async function setR2Cache(data: HomePageData) {
  if (isHomePageDataValid(data)) {
    try {
      await uploadR2(CACHE_KEY, data)
    } catch {
      // eslint-disable-next-line no-empty
    }
  }
}

async function tryFallbackToR2() {
  try {
    const data: HomePageData = await getR2Cache(CACHE_KEY)
    if (isHomePageDataValid(data)) {
      return data
    }
    return null
  } catch {
    return null
  }
}

async function _load() {
  const [tokensResult, statsResult, topWinnerResult, poolsResult] = await Promise.allSettled([
    queryTokens(),
    querySiteStats(),
    queryPredictionUser(),
    queryPools(),
  ])

  const topTokens = tokensResult.status === 'fulfilled' ? tokensResult.value.topTokens : []
  const stats = statsResult.status === 'fulfilled' ? statsResult.value : undefined
  const topWinner = topWinnerResult.status === 'fulfilled' ? topWinnerResult.value : undefined
  const pools = poolsResult.status === 'fulfilled' ? poolsResult.value : []
  const currencies = homePageCurrencies
  const chains = homePageChainsInfo()
  const data = {
    tokens: topTokens,
    pools,
    currencies,
    chains,
    stats,
    partners,
    topWinner,
  } as HomePageData

  /* Saving latest valid data to R2 */
  /* And try to fallback to R2 when data is invalid */
  if (!isHomePageDataValid(data)) {
    const fallbackData = await tryFallbackToR2()
    if (fallbackData) {
      return fallbackData
    }
  } else {
    await setR2Cache(data)
  }
  return data
}
export const loadHomePageData = cacheByLRU(_load, {
  ttl: 300 * 1000, // 5 minutes for update
  maxAge: 60 * 60 * 1000, // 1 hour
  isValid: isHomePageDataValid,
})

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=60, max-age=30, stale-while-revalidate=300')
  const data = await loadHomePageData()
  return res.status(200).json(data)
}

export default handler
