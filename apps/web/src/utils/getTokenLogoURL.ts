import { ChainId, NonEVMChainId } from '@pancakeswap/chains'
import { Token } from '@pancakeswap/sdk'
import memoize from 'lodash/memoize'
import { safeGetUnifiedAddress } from 'utils'
import { BACKEND_API } from 'src/config/constants/endpoints'

const mapping = {
  [ChainId.BSC]: 'smartchain',
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.ZKSYNC]: 'zksync',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.LINEA]: 'linea',
  [ChainId.BASE]: 'base',
  [NonEVMChainId.SOLANA]: 'solana',
}

/**
 * 优先使用后端API获取代币图标
 * 如果后端不可用，则fallback到TrustWallet CDN
 */
const buildTokenLogoURL = (address?: string, chainId?: number): string | null => {
  if (!address || !chainId) return null

  const formattedAddress = safeGetUnifiedAddress(chainId, address)
  if (!formattedAddress) return null

  // 优先使用后端API
  if (BACKEND_API) {
    return `${BACKEND_API}/assets/token/${chainId}/${formattedAddress}`
  }

  // Fallback: TrustWallet CDN
  if (mapping[chainId]) {
    return `https://assets-cdn.trustwallet.com/blockchains/${mapping[chainId]}/assets/${formattedAddress}/logo.png`
  }

  return null
}

const buildTrustWalletLogoURL = (address?: string, chainId?: number): string | null => {
  if (!address || !chainId || !mapping[chainId]) return null

  const formattedAddress = safeGetUnifiedAddress(chainId, address)

  if (!formattedAddress) return null

  return `https://assets-cdn.trustwallet.com/blockchains/${mapping[chainId]}/assets/${formattedAddress}/logo.png`
}

const getTokenLogoURL = memoize(
  (token?: Token) => {
    if (!token) return null
    return buildTokenLogoURL(token.address, token.chainId)
  },
  (t) => `${t?.chainId}#${t?.address}`,
)

export const getTokenLogoURLByAddress = memoize(
  (address?: string, chainId?: number) => buildTokenLogoURL(address, chainId),
  (address, chainId) => `${chainId}#${address}`,
)

/**
 * 仍然保留直接获取TrustWallet URL的方法（作为fallback）
 */
export { buildTrustWalletLogoURL }

export default getTokenLogoURL
