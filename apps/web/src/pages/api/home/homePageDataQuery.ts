import { ChainId } from '@pancakeswap/chains'
import { getCurrencyKey } from '@pancakeswap/price-api-sdk'
import { ASSET_CDN, WALLET_API } from 'config/constants/endpoints'
import keyBy from 'lodash/keyBy'
import { fetchExplorerFarmPools } from 'state/farmsV4/state/farmPools/fetcher'
import { checksumAddress } from 'utils/checksumAddress'
import {
  HomepageChain,
  HomePageCurrency,
  HomePagePairConfig,
  HomePagePartner,
  HomePagePoolInfo,
  HomePageToken,
} from './types'

const tokens: HomePageToken[] = [
  {
    id: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
    symbol: 'BTC',
    chainId: 56,
    price: 0,
    icon: '',
    percent: 0,
  },
  {
    id: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    symbol: 'ETH',
    chainId: 56,
    price: 0,
    icon: '',
    percent: 0,
  },
  {
    id: '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE',
    chainId: 56,
    symbol: 'XRP',
    price: 0,
    icon: '',
    percent: 0,
  },
  {
    id: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
    chainId: 56,
    symbol: 'CAKE',
    price: 0,
    icon: '',
    percent: 0,
  },
]

const pairsConfig: HomePagePairConfig[] = [
  {
    id: '0x172fcD41E0913e95784454622d1c3724f546f849',
    chainId: ChainId.BSC,
  },
  {
    id: '0x36696169C63e42cd08ce11f5deeBbCeBae652050',
    chainId: ChainId.BSC,
  },
  {
    id: '0xD0e226f674bBf064f54aB47F42473fF80DB98CBA',
    chainId: ChainId.BSC,
  },
]

export const partners: HomePagePartner[] = [
  {
    logo: `${ASSET_CDN}/web/landing/partner/x.png`,
    link: 'https://twitter.com/pancakeswap',
    name: 'X',
  },
  {
    logo: `${ASSET_CDN}/web/landing/partner/telegram.png`,
    link: 'https://t.me/pancakeswap',
    name: 'Telegram',
  },
  {
    logo: `${ASSET_CDN}/web/landing/partner/discord.png`,
    link: 'https://discord.gg/pancakeswap',
    name: 'Discord',
  },
  {
    logo: `${ASSET_CDN}/web/landing/partner/instagram.png`,
    link: 'https://www.instagram.com/pancakeswap/',
    name: 'Instagram',
  },
  {
    logo: `${ASSET_CDN}/web/landing/partner/youtube.png`,
    link: 'https://www.youtube.com/c/PancakeSwap',
    name: 'Youtube',
  },
  {
    logo: `${ASSET_CDN}/web/landing/partner/reddit.png`,
    link: 'https://www.reddit.com/',
    name: 'Reddit',
  },
  {
    logo: `${ASSET_CDN}/web/landing/partner/blog.png`,
    link: 'https://blog.pancakeswap.finance/',
    name: 'Blog',
  },
]

export const homePageCurrencies: HomePageCurrency[] = ['usd', 'eur', 'gbp', 'hkd', 'cad', 'aud', 'brl'].map(
  (symbol) => {
    return {
      symbol,
      logo: `${ASSET_CDN}/web/onramp/currencies/${symbol}.png`,
    }
  },
)

function poolId(chainId: ChainId, id: string) {
  return `${chainId}:${id}`
}

export function homePageChainsInfo() {
  const evms = [
    ChainId.BSC,
    ChainId.ETHEREUM,
    ChainId.POLYGON_ZKEVM,
    ChainId.ZKSYNC,
    ChainId.ARBITRUM_ONE,
    ChainId.LINEA,
    ChainId.BASE,
    ChainId.OPBNB,
    ChainId.MONAD_TESTNET,
  ]

  const evmChains: HomepageChain[] = evms.map((chainId) => {
    return {
      logo: `${ASSET_CDN}/web/chains/${chainId}.png`,
      banner: '',
    }
  })
  return evmChains
}

export async function queryPools() {
  const poolsInfo = await fetchExplorerFarmPools()
  const byIds = keyBy(poolsInfo, (x) => poolId(x.chainId, x.lpAddress.toLowerCase()))
  const pairs = pairsConfig.map((x) => {
    const related = byIds[poolId(x.chainId, x.id.toLowerCase())]
    if (!related) {
      throw new Error(`Pool not found for ${x.id}`)
    }
    return {
      id: checksumAddress(related.lpAddress),
      token0: {
        id: related.token0.wrapped.address,
        symbol: related.token0.wrapped.symbol,
        chainId: related.chainId,
      },
      token1: {
        id: related.token1.wrapped.address,
        symbol: related.token0.wrapped.symbol,
        chainId: related.chainId,
      },
      chainId: related.chainId,
      apr24h: Number(related.lpApr),
    } as HomePagePoolInfo
  })
  return pairs
}

async function getTokenPrices(chainId: ChainId, addresses: `0x${string}`[]) {
  const ids = addresses.map((address) => getCurrencyKey({ chainId, address }))
  const url24h = `${WALLET_API}/v1/prices24h/list/${ids.join(',')}`
  const url = `${WALLET_API}/v1/prices/list/${ids.join(',')}`

  const [result, result24h] = await Promise.all([
    fetch(url).then((res) => res.json()),
    fetch(url24h).then((res) => res.json()),
  ])

  return addresses.map((address) => {
    const key = getCurrencyKey({ chainId, address })!
    const price = result[key]
    const price24h = result24h[key]
    return {
      priceUSD: price,
      percent: 100 * ((price24h ? price / price24h : 0) - 1),
    }
  })
}

export async function queryTokens() {
  const prices = await getTokenPrices(
    ChainId.BSC,
    tokens.map((x) => x.id),
  )
  console.log(prices)

  return tokens.map((x, i) => {
    const price = prices[i]
    const addr = checksumAddress(x.id)
    return {
      ...x,
      id: addr,
      price: price ? price.priceUSD : 0,
      percent: price ? price.percent : 0,
      icon: `https://tokens.pancakeswap.finance/images/${addr}.png`,
    }
  })
}
