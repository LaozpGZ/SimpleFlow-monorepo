import { Currency, ZERO_ADDRESS } from '@pancakeswap/sdk'

import { Graph } from '@pancakeswap/utils/Graph'
import { RemoteLogger } from '@pancakeswap/utils/RemoteLogger'
import { BaseRoute, Pool } from '../types'
import { buildBaseRoute, getCurrenciesOfPool } from '../utils'

export function computeAllRoutesNew(
  input: Currency,
  output: Currency,
  candidatePools: Pool[],
  maxHops = 3,
  quoteId?: string,
): BaseRoute[] {
  const logger = RemoteLogger.getLogger(quoteId)
  logger.metric(`computeAllRoutesNew`, 1)
  const graph = new Graph<Currency, Pool>((c) => (c.isNative ? ZERO_ADDRESS : c.address))
  candidatePools.forEach((pool) => {
    const currencies = getCurrenciesOfPool(pool)
    const tokenA = currencies[0]
    const tokenB = currencies[1]
    graph.addEdge(tokenA, tokenB, pool)
    graph.addEdge(tokenB, tokenA, pool)
  })
  const paths = graph.findPaths(input, output, 'dfs', maxHops)
  const routes: BaseRoute[] = paths.map(({ edges }) => buildBaseRoute(edges, input, output))
  logger.metric(`route find`, 1)
  return routes
}
