import { OrderType } from '@pancakeswap/price-api-sdk'
import { InfinityRouter, SmartRouter } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { withTimeout } from '@pancakeswap/utils/withTimeout'
import { globalWorkerAtom } from 'hooks/useWorker'
import { atomFamily } from 'jotai/utils'
import { QUOTE_TIMEOUT } from 'quoter/consts'
import { quoteTraceAtom } from 'quoter/perf/quoteTracker'
import { createPoolQuery } from 'quoter/utils/createQuoteQuery'
import { gasPriceWeiAtom } from 'quoter/utils/gasPriceAtom'
import { getVerifiedTrade } from 'quoter/utils/getVerifiedTrade'
import { isEqualQuoteQuery } from 'quoter/utils/PoolHashHelper'
import { fetchCandidatePools } from 'quoter/utils/poolQueries'
import { InterfaceOrder } from 'views/Swap/utils'
import { InfinityGetBestTradeReturnType, QuoteQuery } from '../quoter.types'
import { atomWithLoadable } from './atomWithLoadable'

export const bestRoutingSDKTradeAtom = atomFamily((option: QuoteQuery) => {
  const { amount, currency, tradeType, maxSplits, v2Swap, v3Swap, infinitySwap } = option
  return atomWithLoadable(async (get) => {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/6eb4557a-7433-4ea8-9e7c-9145e6331316', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'bestRoutingSDKTradeAtom.ts:start',
        message: 'Quote started',
        data: { hasAmount: !!amount, hasCurrency: !!currency, chainId: currency?.chainId },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: 'B',
      }),
    }).catch(() => {})
    // #endregion
    if (!amount || !amount.currency || !currency) {
      return undefined
    }

    const worker = await get(globalWorkerAtom)

    if (!worker) {
      throw new Error('Quote worker not initialized')
    }
    const controller = new AbortController()
    const perf = get(quoteTraceAtom(option))
    perf.tracker.track('start')
    const { chainId } = currency

    const query = withTimeout(
      async () => {
        const { poolQuery, poolOptions } = createPoolQuery(option, controller)
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/6eb4557a-7433-4ea8-9e7c-9145e6331316', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'bestRoutingSDKTradeAtom.ts:fetchPools',
            message: 'Fetching candidate pools',
            data: { chainId, currencyA: poolQuery.currencyA?.symbol, currencyB: poolQuery.currencyB?.symbol },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            hypothesisId: 'B',
          }),
        }).catch(() => {})
        // #endregion
        const [candidatePools, gasPriceWei] = await Promise.all([
          fetchCandidatePools(poolQuery, poolOptions),
          get(gasPriceWeiAtom(currency?.chainId)),
        ])
        // #region agent log
        const poolDetails =
          candidatePools?.map((p: any) => ({
            type: p.type,
            token0: p.token0?.symbol || p.reserve0?.currency?.symbol,
            token1: p.token1?.symbol || p.reserve1?.currency?.symbol,
            fee: p.fee,
            liquidity: p.liquidity?.toString()?.slice(0, 10),
            hasTicks: !!p.ticks?.length,
            tickCount: p.ticks?.length || 0,
          })) || []
        fetch('http://127.0.0.1:7245/ingest/6eb4557a-7433-4ea8-9e7c-9145e6331316', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'bestRoutingSDKTradeAtom.ts:poolsFetched',
            message: 'Candidate pools fetched',
            data: { poolCount: candidatePools?.length || 0, gasPriceWei: gasPriceWei?.toString(), pools: poolDetails },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            hypothesisId: 'B',
          }),
        }).catch(() => {})
        // #endregion
        perf.tracker.track('pool_success')
        const result = await worker.getBestTradeOffchain({
          chainId: currency.chainId,
          currency: SmartRouter.Transformer.serializeCurrency(currency),
          tradeType: tradeType || TradeType.EXACT_INPUT,
          amount: {
            currency: SmartRouter.Transformer.serializeCurrency(amount.currency),
            value: amount.quotient.toString(),
          },
          gasPriceWei: gasPriceWei?.toString() || '',
          maxHops: option.maxHops,
          maxSplits,
          candidatePools: candidatePools.map(SmartRouter.Transformer.serializePool),
          signal: controller.signal,
        })
        const trade = InfinityRouter.Transformer.parseTrade(currency.chainId, result) ?? null
        const verifiedTrade = await getVerifiedTrade(trade)

        if (verifiedTrade) {
          verifiedTrade.quoteQueryHash = option.hash
        }
        const order = {
          type: OrderType.PCS_CLASSIC,
          trade: (verifiedTrade || undefined) as InfinityGetBestTradeReturnType | undefined,
        } as InterfaceOrder
        perf.tracker.success(order)
        return order
      },
      {
        ms: QUOTE_TIMEOUT[chainId],
        abort: () => {
          controller.abort()
        },
      },
    )

    try {
      const result = await query()
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/6eb4557a-7433-4ea8-9e7c-9145e6331316', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'bestRoutingSDKTradeAtom.ts:success',
          message: 'Quote succeeded',
          data: { hasTrade: !!result?.trade, tradeType: result?.type },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          hypothesisId: 'E',
        }),
      }).catch(() => {})
      // #endregion
      return result
    } catch (ex: any) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/6eb4557a-7433-4ea8-9e7c-9145e6331316', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'bestRoutingSDKTradeAtom.ts:error',
          message: 'Quote failed',
          data: { error: ex?.message || String(ex) },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          hypothesisId: 'E',
        }),
      }).catch(() => {})
      // #endregion
      perf.tracker.fail(ex)
      controller.abort()
      throw ex
    } finally {
      perf.tracker.report()
    }
  })
}, isEqualQuoteQuery)
