import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'
import { NextApiHandler } from 'next'
import { fetchTokenChartData } from 'views/V3Info/data/token/chartData'
import { fetchPoolsForToken } from 'views/V3Info/data/token/poolsForToken'
import { fetchedTokenData } from 'views/V3Info/data/token/tokenData'
import { fetchTokenTransactions } from 'views/V3Info/data/token/transactions'

const chainNameForQuery = (chain: string) => {
  switch (chain) {
    case 'eth':
      return 'ethereum'
    case 'polygon-zkevm':
      return 'polygon-zkevm'
    case 'zksync':
      return 'zksync'
    case 'arb':
      return 'arbitrum'
    case 'linea':
      return 'linea'
    case 'base':
      return 'base'
    case 'opbnb':
      return 'opbnb'
    default:
      return 'bsc'
  }
}

async function _loadData(chain?: string, address?: string) {
  if (!chain || !address) {
    return null
  }

  const queryChainName = chainNameForQuery(chain)!

  const result = await Promise.all([
    fetchPoolsForToken(address, queryChainName),
    fetchedTokenData(queryChainName, address),
    fetchTokenTransactions(address, queryChainName),
    fetchTokenChartData('v3', queryChainName, address),
  ])

  const hasError = result.some((r) => r.error)
  if (hasError) {
    return null
  }

  const [poolsData, token, transactions, charts] = result.map((x) => x.data)

  return {
    token,
    pool: poolsData,
    transactions,
    charts,
  }
}

const loadData = cacheByLRU(_loadData, {
  ttl: 300_1000,
  maxCacheSize: 10000,
})

const handler: NextApiHandler = async (req, res) => {
  const { chain, token } = req.query

  const result = await loadData(String(chain), String(token))
  res.setHeader('Cache-Control', 's-maxage=60, max-age=30, stale-while-revalidate=300')

  return res.status(200).json(result)
}

export default handler
