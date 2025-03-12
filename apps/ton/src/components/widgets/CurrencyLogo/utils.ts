import { ChainId } from '@pancakeswap/chains'
import { Token } from '@pancakeswap/sdk'
import memoize from 'lodash/memoize'

const mapping: { [key: number]: string } = {
  [ChainId.BSC]: 'smartchain',
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.POLYGON_ZKEVM]: 'polygonzkevm',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.ZKSYNC]: 'zksync',
  [ChainId.BASE]: 'base',
  [ChainId.LINEA]: 'linea',
  [ChainId.OPBNB]: 'opbnb',
}

export const getTokenLogoURL = memoize(
  (token?: Token) => {
    if (token && mapping[token.chainId]) {
      return `https://assets-cdn.trustwallet.com/blockchains/${mapping[token.chainId]}/assets/${token.address}/logo.png`
    }
    return null
  },
  (t) => `${t?.chainId}#${t?.address}`,
)

export const getTokenLogoURLByAddress = memoize(
  (address?: string, chainId?: number) => {
    if (address && chainId && mapping[chainId]) {
      return `https://assets-cdn.trustwallet.com/blockchains/${mapping[chainId]}/assets/${address}/logo.png`
    }
    return null
  },
  (address, chainId) => `${chainId}#${address}`,
)

export const chainName: { [key: number]: string } = {
  [ChainId.BSC]: '',
  [ChainId.ETHEREUM]: 'eth',
  [ChainId.POLYGON_ZKEVM]: 'polygon-zkevm',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.ZKSYNC]: 'zksync',
  [ChainId.LINEA]: 'linea',
  [ChainId.BASE]: 'base',
  [ChainId.OPBNB]: 'opbnb',
}

// TODO: move to utils or token-list
export const getTokenListBaseURL = (chainId: number) =>
  `https://tokens.pancakeswap.finance/images/${chainName[chainId]}`

export const getTokenListTokenUrl = (token: Pick<Token, 'chainId' | 'address'>) =>
  Object.keys(chainName).includes(String(token.chainId))
    ? `https://tokens.pancakeswap.finance/images/${
        token.chainId === ChainId.BSC ? '' : `${chainName[token.chainId]}/`
      }${token.address}.png`
    : null
