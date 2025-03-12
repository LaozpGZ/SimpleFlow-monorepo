import { ASSET_CDN } from 'config/constants/endpoints'
import styled from 'styled-components'
import { MultipleLogos } from './MultipleLogos'

const ChainImage = styled.img`
  width: 16px;
  height: 16px;
  position: absolute;
  bottom: -4px;
  right: -4px;
  background-color: white;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

interface Token {
  id?: `0x${string}`
  logo: string
}

interface MultipleCurrencyLogosProps {
  tokens: Token[]
  chainId?: number
  maxDisplay?: number
  isFirstSmall?: boolean
  borderRadius?: string
}

export const MultipleCurrencyLogos = ({
  tokens,
  chainId,
  maxDisplay = 3,
  isFirstSmall,
  borderRadius,
}: MultipleCurrencyLogosProps) => {
  const chainIcon = chainId ? `${ASSET_CDN}/web/chains/${chainId}.png` : null

  return (
    <MultipleLogos
      borderRadius={borderRadius}
      isFirstSmall={isFirstSmall}
      logos={tokens.map((token) => token.logo!)}
      maxDisplay={maxDisplay}
    >
      {chainIcon && <ChainImage src={chainIcon} />}
    </MultipleLogos>
  )
}
