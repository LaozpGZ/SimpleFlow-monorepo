import { ASSET_CDN } from 'config/constants/endpoints'
import { DefaultSeoProps } from 'next-seo'

export const SEO: DefaultSeoProps = {
  titleTemplate: '%s | SimpleFlow',
  defaultTitle: 'SimpleFlow',
  description: 'Trade, earn, and own crypto on the all-in-one multichain DEX',
  twitter: {
    cardType: 'summary_large_image',
    handle: '@SimpleFlow',
    site: '@SimpleFlow',
  },
  openGraph: {
    title: "SimpleFlow - Everyone's Favorite DEX",
    description: 'Trade, earn, and own crypto on the all-in-one multichain DEX',
    images: [{ url: `${ASSET_CDN}/web/og/v2/hero.jpg` }],
  },
}
