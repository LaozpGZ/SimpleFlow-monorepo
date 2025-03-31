import { Pair } from '@pancakeswap/sdk'
import { RemoteLogger } from '@pancakeswap/utils/RemoteLogger'
import { BaseRoute, Pool, PoolType, RouteType, RouteWithQuote } from '../types'

export const logPools = (quoteId: string | undefined, pools: Pool[], indent = 1) => {
  const logger = RemoteLogger.getLogger(quoteId)

  for (const pool of pools) {
    switch (pool.type) {
      case PoolType.V3: {
        const id = pool.address
        logger.debug(`[V3] id=${id}, ${pool.token0.symbol}/${pool.token1.symbol}`, indent)
        break
      }
      case PoolType.V2: {
        const id = Pair.getAddress(pool.reserve0.currency.wrapped, pool.reserve1.currency.wrapped)
        logger.debug(`[V2] id=${id}, ${pool.reserve0.currency.symbol}/${pool.reserve1.currency.symbol}`, indent)
        break
      }
      case PoolType.STABLE: {
        logger.debug(
          `[Stable] id=${pool.address}, ${pool.balances[0].currency.symbol}/${pool.balances[1].currency.symbol}`,
          indent,
        )
        break
      }
      case PoolType.InfinityBIN: {
        logger.debug(`[InfinityBIN] id=${pool.id}, ${pool.currency0.symbol}/${pool.currency1.symbol}`, indent)
        break
      }
      case PoolType.InfinityCL: {
        logger.debug(`[InfinityCL] id=${pool.id}, ${pool.currency0.symbol}/${pool.currency1.symbol}`, indent)
        break
      }
      default:
        throw new Error('Unknown pool type')
    }
  }
}

export const logRoutes = (quoteId: string | undefined, routes: BaseRoute[], indent = 1) => {
  for (const [i, route] of Object.entries(routes)) {
    const logger = RemoteLogger.getLogger(quoteId)
    const { type, pools, input, output } = route
    logger.debug(`- #${i} ${RouteType[type]}, pools=${pools.length}, ${input.symbol}/${output.symbol}`, indent)
    logPools(quoteId, pools, indent + 1)
  }
}

export const logRoutesWithQuote = (quoteId: string | undefined, _routes: RouteWithQuote[], indent = 1) => {
  const routes = _routes.slice()
  routes.sort((a, b) => a.percent - b.percent)
  for (const [i, route] of Object.entries(routes)) {
    const logger = RemoteLogger.getLogger(quoteId)
    const percent = route.percent.toFixed(2)
    const amt = route.amount
    const { type, pools, input, output, quote } = route
    logger.debug(
      `- #${i} [${percent}%] ${RouteType[type]}, pools=${pools.length}, ${input.symbol}/${output.symbol}`,
      indent,
    )
    logger.debug(
      `quote: input:${amt.toFixed(2)} ${input.symbol} quote:${quote.toFixed(2)} ${output.symbol}`,
      indent + 1,
    )

    logPools(quoteId, pools, indent + 1)
  }
}
