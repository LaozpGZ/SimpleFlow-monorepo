import { ASSET_CDN } from 'config/constants/endpoints'
import styled from 'styled-components'
import { MultipleLogos } from './MultipleLogos'

const ChainImage = styled.img`
  width: 10px;
  height: 10px;
  position: absolute;
  bottom: 0px;
  right: 0px;
  background-color: transparent;
  border-radius: 4px;
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
  gap?: number
}

export const MultipleCurrencyLogos = ({
  tokens,
  chainId,
  maxDisplay = 3,
  isFirstSmall,
  gap,
  borderRadius,
}: MultipleCurrencyLogosProps) => {
  const chainIcon = chainId ? `${ASSET_CDN}/web/chains/svg/${chainId}.svg` : null

  return (
    <MultipleLogos
      borderRadius={borderRadius}
      isFirstSmall={isFirstSmall}
      logos={tokens.map((token) => token.logo!)}
      maxDisplay={maxDisplay}
      gap={gap}
    >
      {chainIcon && <ChainImage src={chainIcon} />}
    </MultipleLogos>
  )
}
