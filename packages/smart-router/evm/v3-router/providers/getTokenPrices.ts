import { Currency } from '@pancakeswap/sdk'
import { ChainId, getLlamaChainName } from '@pancakeswap/chains'
import { getAddress, Address, formatUnits } from 'viem'
import { gql } from 'graphql-request'
import { CAKE, STABLE_COIN } from '@pancakeswap/tokens'
import { OnChainProvider, SubgraphProvider } from '../types'
import { withFallback } from '../../utils/withFallback'
import { chainlinkOracleABI } from '../../abis/chainlinkOracle'

type TokenUsdPrice = {
  address: string
  priceUSD: string
}

type TokenPriceOptions = {
  usingQuoter?: boolean
  subgraphProvider?: SubgraphProvider
  onChainProvider?: OnChainProvider
  quoterFetcher?: (currencies: Currency[]) => Promise<Map<ChainId, Map<Address, number>>>
}

const llamaCache = new Map<string, TokenUsdPrice>()
const llamaEndpoint = 'https://coins.llama.fi/prices/current'
const walletApiEndpoint = 'https://wallet-api.pancakeswap.com/v1/prices/list'
const chainlinkOracleCAKEAddress = '0xB6064eD41d4f67e353768aA239cA86f4F73665a1'

const tokenPriceQuery = gql`
  query getTokens($pageSize: Int!, $tokenAddrs: [ID!]) {
    tokens(first: $pageSize, where: { id_in: $tokenAddrs }) {
      id
      derivedUSD
    }
  }
`

function groupByChain<T extends { chainId: ChainId }>(items: T[]): Map<ChainId, T[]> {
  const map = new Map<ChainId, T[]>()
  for (const item of items) {
    if (!map.has(item.chainId)) {
      map.set(item.chainId, [])
    }
    map.get(item.chainId)!.push(item)
  }
  return map
}

function createLlamaFetcher(): (
  currencies: Currency[],
) => Promise<Map<ChainId, Map<Address, { price: number; from: string }>>> {
  return async (currencies) => {
    const result = new Map<ChainId, Map<Address, { price: number; from: string }>>()
    const currencyMap = new Map<string, Currency>()

    for (const currency of currencies) {
      const address = getAddress(currency.wrapped.address)
      const chainName = getLlamaChainName(currency.chainId)
      const key = `${chainName}:${address}`
      currencyMap.set(key, currency)
    }

    const uncached: string[] = []
    for (const [key, currency] of currencyMap.entries()) {
      const cached = llamaCache.get(currency.wrapped.address)
      if (!cached) {
        uncached.push(key)
      } else {
        const chainMap = result.get(currency.chainId) || new Map()
        chainMap.set(getAddress(currency.wrapped.address), parseFloat(cached.priceUSD))
        result.set(currency.chainId, chainMap)
      }
    }

    if (uncached.length > 0) {
      const res: { coins?: { [key: string]: { price: string } } } = await fetch(
        `${llamaEndpoint}/${uncached.join(',')}`,
      ).then((r) => r.json())

      for (const [key, { price }] of Object.entries(res?.coins ?? {})) {
        const [, addr] = key.split(':')
        const currency = currencyMap.get(key)
        if (!currency) continue

        const parsedPrice = parseFloat(price)
        llamaCache.set(addr, { address: addr, priceUSD: price })
        const chainMap = result.get(currency.chainId) || new Map<Address, { price: number; from: string }>()
        chainMap.set(getAddress(addr), { price: parsedPrice, from: 'llama' })
        result.set(currency.chainId, chainMap)
      }
    }

    return result
  }
}

function createWalletApiFetcher(): (
  currencies: Currency[],
) => Promise<Map<ChainId, Map<Address, { price: number; from: string }>>> {
  return async (currencies) => {
    const result = new Map<ChainId, Map<Address, { price: number; from: string }>>()
    const keys = currencies.map((c) => `${c.chainId}:${getAddress(c.wrapped.address).toLowerCase()}`)
    const encoded = encodeURIComponent(keys.join(','))
    const res: Record<string, number> = await fetch(`${walletApiEndpoint}/${encoded}`).then((r) => r.json())

    for (const [key, price] of Object.entries(res)) {
      const [chainIdStr, address] = key.split(':')
      const chainId = parseInt(chainIdStr) as ChainId
      const chainMap = result.get(chainId) || new Map<Address, { price: number; from: string }>()
      chainMap.set(getAddress(address), { price, from: 'api' })
      result.set(chainId, chainMap)
    }

    return result
  }
}

function createSubgraphFetcher(
  provider?: SubgraphProvider,
): (currencies: Currency[]) => Promise<Map<ChainId, Map<Address, { price: number; from: string }>>> {
  return async (currencies) => {
    const result = new Map<ChainId, Map<Address, { price: number; from: string }>>()
    const grouped = groupByChain(currencies)

    for (const [chainId, chainCurrencies] of grouped.entries()) {
      const client = provider?.({ chainId })
      if (!client) continue

      try {
        const addresses = chainCurrencies.map((c) => getAddress(c.wrapped.address))
        // eslint-disable-next-line no-await-in-loop
        const { tokens } = await client.request<{ tokens: { id: string; derivedUSD: string }[] }>(tokenPriceQuery, {
          pageSize: 1000,
          tokenAddrs: addresses.map((a) => a.toLowerCase()),
        })

        for (const { id, derivedUSD } of tokens) {
          const addr = getAddress(id)
          const chainMap = result.get(chainId) || new Map<Address, { price: number; from: string }>()
          chainMap.set(addr, { price: parseFloat(derivedUSD), from: 'subgraph' })
          result.set(chainId, chainMap)
        }
      } catch (err) {
        console.warn(`Subgraph error for chain ${chainId}:`, err)
      }
    }

    return result
  }
}

const getCakePriceFromOracle = async (provider?: OnChainProvider) => {
  try {
    const client = provider?.({ chainId: ChainId.BSC })
    if (!client) {
      throw new Error('Failed to get viem client')
    }
    const data = await client.readContract({
      abi: chainlinkOracleABI,
      address: chainlinkOracleCAKEAddress,
      functionName: 'latestAnswer',
    })

    return formatUnits(data, 8)
  } catch {
    console.warn('Failed to fetch CAKE price from oracle')
    return undefined
  }
}

export async function getTokenPrices(
  currencies: Currency[],
  options?: TokenPriceOptions,
): Promise<Map<ChainId, Map<Address, { price: number; from: string }>>> {
  const result = new Map<ChainId, Map<Address, { price: number; from: string }>>()

  const currencyMap = new Map<string, Currency>()
  for (const c of currencies) {
    currencyMap.set(`${c.chainId}:${getAddress(c.wrapped.address)}`, c)
  }

  const fallbackCurrencies: Currency[] = []

  for (const currency of currencyMap.values()) {
    const { chainId } = currency
    const address = getAddress(currency.wrapped.address)
    const { isNative } = currency

    const stableCoin = STABLE_COIN[chainId as ChainId]
    // @ts-ignore
    const cake = CAKE[chainId as ChainId]

    if (!stableCoin) {
      throw new Error(`Unsupported chainId: ${chainId}`)
    }

    if (!isNative && cake && cake.address.toLowerCase() === address.toLowerCase()) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const price = await getCakePriceFromOracle(options?.onChainProvider)
        const chainMap = result.get(chainId) ?? new Map()
        chainMap.set(getAddress(address), { price: Number(price), from: 'oracle' })
        result.set(chainId, chainMap)
        continue
      } catch (e) {
        console.warn(`Failed to fetch CAKE oracle price for ${chainId}:`, e)
        fallbackCurrencies.push(currency)
        continue
      }
    }

    if (
      (!isNative && stableCoin.address.toLowerCase() === address.toLowerCase()) ||
      (isNative && stableCoin.isNative)
    ) {
      const chainMap = result.get(chainId) ?? new Map()
      chainMap.set(address, { price: 1, from: 'calc' })
      result.set(chainId, chainMap)
      continue
    }

    fallbackCurrencies.push(currency)
  }

  const fetchWithFallback = withFallback([
    {
      asyncFn: createWalletApiFetcher(),
      timeout: 3000,
    },
    {
      asyncFn: createLlamaFetcher(),
      timeout: 3000,
    },
    {
      asyncFn: createSubgraphFetcher(options?.subgraphProvider),
    },
  ])

  const fetchedPrices = await fetchWithFallback(fallbackCurrencies)

  for (const [chainId, map] of fetchedPrices.entries()) {
    const existing = result.get(chainId) ?? new Map<Address, { price: number; from: string }>()
    for (const [addr, { price, from }] of map.entries()) {
      if (!existing.has(addr)) {
        existing.set(addr, { price, from })
      }
    }
    result.set(chainId, existing)
  }

  if (options?.usingQuoter) {
    const missingCurrencies = fallbackCurrencies.filter((c) => {
      const chainPrices = result.get(c.chainId)
      return !chainPrices || !chainPrices.has(getAddress(c.wrapped.address))
    })

    if (missingCurrencies.length > 0) {
      try {
        const quoterPrices = await options.quoterFetcher?.(missingCurrencies)
        if (quoterPrices) {
          for (const [chainId, map] of quoterPrices.entries()) {
            const existing = result.get(chainId) ?? new Map<Address, { price: number; from: string }>()
            for (const [addr, price] of map.entries()) {
              if (!existing.has(addr)) {
                existing.set(addr, { price, from: 'quote' })
              }
            }
            result.set(chainId, existing)
          }
        }
      } catch (err) {
        console.warn('Quoter fetcher failed:', err)
      }
    }
  }

  return result
}
