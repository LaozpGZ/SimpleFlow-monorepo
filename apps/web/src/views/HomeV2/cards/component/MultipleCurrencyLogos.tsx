import { Box } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { ASSET_CDN } from 'config/constants/endpoints'
import styled from 'styled-components'

const ChainImage = styled.img`
  width: 16px;
  height: 16px;
  position: absolute;
  bottom: -4px;
  right: -4px;
  background-color: white;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

const LogoWrapper = styled(Box)`
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
`

const OverlapLogo = styled(CurrencyLogo)`
  flex-shrink: 0;
  border: 2px solid white;
  border-radius: 50%;

  &:not(:first-child) {
    margin-left: -8px;
  }
`

const ExtraCount = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border-width: 3px;
  background: ${({ theme }) => theme.colors.secondary10};
  font-family: Kanit;
  font-weight: 600;
  font-size: 20px;
  line-height: 30px;
  letter-spacing: -1%;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin-left: -8px;
  border: 2px solid white;
`

interface Token {
  id?: `0x${string}`
  logo?: string
}

interface MultipleCurrencyLogosProps {
  tokens: Token[]
  chainId?: number
  maxDisplay?: number
}

export const MultipleCurrencyLogos = ({ tokens, chainId, maxDisplay = 3 }: MultipleCurrencyLogosProps) => {
  const chainIcon = chainId ? `${ASSET_CDN}/web/chains/${chainId}.png` : null
  const displayedTokens = tokens.slice(0, maxDisplay)
  const hiddenTokenCount = tokens.length - displayedTokens.length

  return (
    <LogoWrapper>
      {displayedTokens.map((token) => (
        <OverlapLogo
          key={token.id}
          currency={{ address: token.id, chainId, isToken: true, logoURI: token.logo }}
          size="40px"
        />
      ))}
      {hiddenTokenCount > 0 && <ExtraCount>+{hiddenTokenCount}</ExtraCount>}
      {chainIcon && <ChainImage src={chainIcon} />}
    </LogoWrapper>
  )
}
