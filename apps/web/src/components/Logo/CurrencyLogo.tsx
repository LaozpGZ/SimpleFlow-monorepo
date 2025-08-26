import { ChainId } from '@pancakeswap/chains'
import { useHttpLocations } from '@pancakeswap/hooks'
import { Token, UnifiedCurrency } from '@pancakeswap/sdk'
import { ChainLogo } from '@pancakeswap/widgets-internal'
import { WrappedTokenInfo } from '@pancakeswap/token-lists'
import { BinanceIcon, TokenLogo } from '@pancakeswap/uikit'
import { getImageUrlsFromToken } from 'components/TokenImage'
import { ASSET_CDN } from 'config/constants/endpoints'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import getTokenLogoURL from '../../utils/getTokenLogoURL'

const StyledLogo = styled(TokenLogo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
`

const LogoContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`

const StyledChainLogo = styled(ChainLogo)`
  position: absolute;
  right: 6px;
  bottom: -6px;

  & > img {
    background-color: ${({ theme }) => theme.colors.invertedContrast};
    border: 0px solid ${({ theme }) => theme.colors.invertedContrast};
    border-radius: 35%;
  }
`

interface LogoProps {
  currency?: UnifiedCurrency
  size?: string
  style?: React.CSSProperties
  src?: string
  showChainLogo?: boolean
}

export function FiatLogo({ currency, size = '24px', style }: LogoProps) {
  return (
    <StyledLogo
      size={size}
      srcs={[`${ASSET_CDN}/web/onramp/currencies/${currency?.symbol?.toLowerCase()}.png`]}
      width={size}
      style={style}
    />
  )
}

export default function CurrencyLogo({ currency, size = '24px', style, src, showChainLogo = false }: LogoProps) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)
  // @ts-ignore
  const imageUrls = getImageUrlsFromToken(currency)
  const basicTokenImage = getBasicTokensImage(currency)

  const srcs: string[] = useMemo(() => {
    if (currency?.isNative) return []

    if (currency?.isToken) {
      const tokenLogoURL = getTokenLogoURL(currency as Token)

      if (currency instanceof WrappedTokenInfo) {
        if (!tokenLogoURL) return [...imageUrls, ...uriLocations, basicTokenImage]
        return [...imageUrls, ...uriLocations, tokenLogoURL, basicTokenImage]
      }
      if (!tokenLogoURL) return [...imageUrls, basicTokenImage]
      return [...imageUrls, tokenLogoURL, basicTokenImage]
    }
    return []
  }, [currency, uriLocations])

  if (currency?.isNative) {
    if (currency.chainId === ChainId.BSC) {
      return (
        <LogoContainer>
          <BinanceIcon width={size} style={style} />
          {showChainLogo && <StyledChainLogo chainId={currency?.chainId} width={10} height={10} />}
        </LogoContainer>
      )
    }
    return (
      <LogoContainer>
        <StyledLogo size={size} srcs={[`${ASSET_CDN}/web/native/${currency.chainId}.png`]} width={size} style={style} />
        {showChainLogo && <StyledChainLogo chainId={currency?.chainId} width={10} height={10} />}
      </LogoContainer>
    )
  }

  return (
    <LogoContainer>
      <StyledLogo
        size={size}
        srcs={src ? [src, ...srcs] : srcs}
        alt={`${currency?.symbol ?? 'token'} logo`}
        style={style}
      />
      {showChainLogo && <StyledChainLogo chainId={currency?.chainId} width={10} height={10} />}
    </LogoContainer>
  )
}

const basicTokensList = ['USDT', 'USDC', 'DAI', 'WBNB', 'WETH', 'WBTC', 'BNB', 'BUSD']

export const getBasicTokensImage = (token: UnifiedCurrency | undefined) => {
  if (!token) return ''
  return basicTokensList.includes(token?.symbol)
    ? `https://tokens.pancakeswap.finance/images/symbol/${token?.symbol?.toLowerCase() ?? ''}.png`
    : ''
}
