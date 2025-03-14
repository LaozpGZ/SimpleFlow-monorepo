import { ChainId } from '@pancakeswap/chains'
import { ASSET_CDN } from 'config/constants/endpoints'
import { HomepageChain, HomePageCurrency, HomePagePartner } from './types'

export const partners: HomePagePartner[] = [
  {
    logo: `${ASSET_CDN}/web/landing/partner/x.png`,
    link: 'https://twitter.com/pancakeswap',
    name: '(ex. Twitter)',
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
    link: 'https://instagram.com/pancakeswap_official',
    name: 'Instagram',
  },
  {
    logo: `${ASSET_CDN}/web/landing/partner/youtube.png`,
    link: 'https://www.youtube.com/@pancakeswap_official',
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
  ]

  const evmChains: HomepageChain[] = evms.map((chainId) => {
    return {
      logo: `${ASSET_CDN}/web/chains/svg/${chainId}.svg`,
      logoM: `${ASSET_CDN}/web/chains/svg/${chainId}-m.svg`,
      logoL: `${ASSET_CDN}/web/chains/svg/${chainId}-l.svg`,
    }
  })
  evmChains.push({
    logo: `${ASSET_CDN}/web/chains/svg/aptos.svg`,
    logoM: `${ASSET_CDN}/web/chains/svg/aptos-m.svg`,
    logoL: `${ASSET_CDN}/web/chains/svg/aptos-l.svg`,
  })
  return evmChains
}
