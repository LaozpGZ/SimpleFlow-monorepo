/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-globals */

/**
 * Assets API - 图标 CDN 代理
 * 返回图片二进制数据，与原始 CDN 行为一致
 *
 * 响应格式与 NestJS 后端保持一致
 */

import { CORS_ALLOW, handleCors, wrapCorsHeader } from '@pancakeswap/worker-utils'
import { Router } from 'itty-router'
import { error, missing } from 'itty-router-extras'

const router = Router()

// PancakeSwap CDN URLs
const PCS_TOKEN_CDN = 'https://tokens.pancakeswap.finance'
const PCS_ASSETS_CDN = 'https://assets.pancakeswap.finance'

// TrustWallet CDN URLs
const TRUSTWALLET_CDN = 'https://assets-cdn.trustwallet.com'

// Chain ID 到 TrustWallet 路径映射
const CHAIN_TO_TRUSTWALLET: Record<number, string> = {
  1: 'ethereum',
  56: 'smartchain',
  137: 'polygon',
  250: 'fantom',
  42161: 'arbitrum',
  10: 'optimism',
  43114: 'avalanche',
  25: 'cronos',
  324: 'zksync',
  59144: 'linea',
  8453: 'base',
}

/**
 * 获取代币图标（返回图片二进制）
 * GET /assets/token/:chainId/:address
 *
 * 与原始 CDN 行为一致：直接返回图片数据
 */
router.get('/assets/token/:chainId/:address', async ({ params }) => {
  const { chainId, address } = params
  const chainIdNum = parseInt(chainId, 10)
  const normalizedAddress = address.toLowerCase()

  // 尝试 CDN URLs
  const urls = [`${PCS_TOKEN_CDN}/images/${normalizedAddress}.png`]

  // 添加 TrustWallet
  const trustPath = CHAIN_TO_TRUSTWALLET[chainIdNum]
  if (trustPath) {
    urls.push(`${TRUSTWALLET_CDN}/blockchains/${trustPath}/assets/${normalizedAddress}/logo.png`)
  }

  // 添加 PancakeSwap Assets
  urls.push(`${PCS_ASSETS_CDN}/tokens/${chainIdNum}/${normalizedAddress}.png`)

  // 按顺序尝试
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SimpleFlowAssets/1.0)',
        },
      })
      if (response.ok && response.headers.get('Content-Type')?.includes('image')) {
        const image = await response.arrayBuffer()
        return new Response(image, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400, immutable',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
    } catch (e) {
      // 继续尝试下一个
    }
  }

  return error(404, 'Icon not found')
})

/**
 * 获取链图标（返回图片二进制）
 * GET /assets/chain/:chainId
 */
router.get('/assets/chain/:chainId', async ({ params }) => {
  const { chainId } = params
  const chainIdNum = parseInt(chainId, 10)

  const urls = [
    `${PCS_ASSETS_CDN}/images/chains/${chainIdNum}.png`,
    `${PCS_ASSETS_CDN}/images/chains/eip155:${chainIdNum}.png`,
  ]

  const trustPath = CHAIN_TO_TRUSTWALLET[chainIdNum]
  if (trustPath) {
    urls.push(`${TRUSTWALLET_CDN}/blockchains/${trustPath}/info/logo.png`)
  }

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SimpleFlowAssets/1.0)',
        },
      })
      if (response.ok && response.headers.get('Content-Type')?.includes('image')) {
        const image = await response.arrayBuffer()
        return new Response(image, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400, immutable',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
    } catch (e) {
      // 继续尝试下一个
    }
  }

  return error(404, 'Chain icon not found')
})

/**
 * 获取符号图标（返回图片二进制）
 * GET /assets/symbol/:symbol
 */
router.get('/assets/symbol/:symbol', async ({ params }) => {
  const { symbol } = params

  const urls = [
    `${PCS_TOKEN_CDN}/images/symbol/${symbol.toLowerCase()}.png`,
    `${PCS_ASSETS_CDN}/images/coins/${symbol.toLowerCase()}.png`,
    `${PCS_TOKEN_CDN}/images/${symbol.toLowerCase()}.png`,
  ]

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SimpleFlowAssets/1.0)',
        },
      })
      if (response.ok && response.headers.get('Content-Type')?.includes('image')) {
        const image = await response.arrayBuffer()
        return new Response(image, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400, immutable',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
    } catch (e) {
      // 继续尝试下一个
    }
  }

  return error(404, 'Symbol icon not found')
})

/**
 * 健康检查
 * GET /assets/health
 */
router.get('/assets/health', () => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'assets-api',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
})

/**
 * API 信息
 * GET /assets/
 */
router.get('/assets', () => {
  return new Response(
    JSON.stringify({
      name: 'Assets API',
      version: '1.0.0',
      description: 'Icon CDN proxy - returns image binary like original CDN',
      endpoints: {
        token: 'GET /assets/token/:chainId/:address (returns image)',
        chain: 'GET /assets/chain/:chainId (returns image)',
        symbol: 'GET /assets/symbol/:symbol (returns image)',
        health: 'GET /assets/health',
        info: 'GET /assets/',
      },
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
})

router.options('*', handleCors(CORS_ALLOW, 'GET, OPTIONS', '*'))

router.all('*', () => missing('Not found'))

addEventListener('fetch', (event) =>
  event.respondWith(
    router
      .handle(event.request, event)
      .then((res) => wrapCorsHeader(event.request, res, { allowedOrigin: CORS_ALLOW })),
  ),
)
