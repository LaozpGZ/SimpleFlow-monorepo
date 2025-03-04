import { ChainId, getChainIdByChainName } from '@pancakeswap/chains'
import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'
import { NextApiHandler } from 'next'
import {
  fetchV2ChartsTvlData,
  fetchV2ChartsVolumeData,
  fetchV2PoolsForToken,
  fetchV2TokenData,
  fetchV2TransactionData,
  V2TokenDataQuery,
} from 'state/info/dataQuery'
import { fetchTokenChartData } from 'views/V3Info/data/token/chartData'
import { fetchPoolsForToken } from 'views/V3Info/data/token/poolsForToken'
import { fetchedTokenData } from 'views/V3Info/data/token/tokenData'
import { fetchTokenTransactions } from 'views/V3Info/data/token/transactions'

type SupportedType = 'swap' | 'v3' | 'stableSwap'

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

async function _loadData(chain?: string, address?: string, type?: SupportedType) {
  if (!chain || !address || !type) {
    return null
  }

  const queryChainName = chainNameForQuery(chain)!

  switch (type) {
    case 'stableSwap':
    case 'swap': {
      const chainId = getChainIdByChainName(chain) || ChainId.BSC
      const query: V2TokenDataQuery = {
        chainName: chain as 'bsc' | 'ethereum' | 'arbitrum',
        chainId: parseInt(chainId as any as string),
        address,
        type,
      }
      const result = await Promise.all([
        fetchV2TokenData(query),
        fetchV2PoolsForToken(query),
        fetchV2TransactionData(query),
        fetchV2ChartsVolumeData(query),
        fetchV2ChartsTvlData(query),
      ])

      const [token, pool, transactions, chartVolume, chartTvl] = result
      return {
        token,
        pool,
        transactions,
        chartVolume,
        chartTvl,
      }
    }

    case 'v3': {
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
    default: {
      return null
    }
  }
}

const loadData = cacheByLRU(_loadData, {
  ttl: 300_1000,
  maxCacheSize: 10000,
})

const handler: NextApiHandler = async (req, res) => {
  const { chain, token, type } = req.query

  const result = await loadData(String(chain), String(token), type as SupportedType | undefined)
  res.setHeader('Cache-Control', 's-maxage=60, max-age=30, stale-while-revalidate=300')

  return res.status(200).json(result)
}

export default handler
