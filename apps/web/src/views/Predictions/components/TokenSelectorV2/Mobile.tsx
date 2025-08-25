import { PredictionConfig } from '@pancakeswap/prediction'
import { Box, Flex, Text } from '@pancakeswap/uikit'
import { TokenImage } from 'components/TokenImage'
import { styled } from 'styled-components'
import { Price } from 'views/Predictions/components/TokenSelector/Price'
import { useConfig } from 'views/Predictions/context/ConfigProvider'

interface MobilePredictionTokenSelectorProps {
  tokens: PredictionConfig[]
  onClickSwitchToken: (tokenSymbol: string) => void
}

const MobileTabContainer = styled(Flex)`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 1.25rem;
  padding: 0.125rem;
  display: flex;
  align-items: center;
  width: fit-content;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

const MobileTabItem = styled(Flex)<{ isActive: boolean }>`
  background: ${({ theme, isActive }) => (isActive ? theme.colors.background : 'transparent')};
  border-radius: 1rem;
  padding: ${({ isActive }) => (isActive ? '0.5rem 0.75rem' : '0.5rem')};
  cursor: pointer;
  align-items: center;
  gap: ${({ isActive }) => (isActive ? '0.375rem' : '0')};
  min-width: fit-content;
  flex-shrink: 0;
  transition: all 0.15s ease;
  position: relative;

  ${({ theme, isActive }) =>
    isActive &&
    `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 1px solid ${theme.colors.primary};
      border-radius: 1rem;
      pointer-events: none;
    }
  `}

  &:hover {
    background: ${({ theme, isActive }) => (isActive ? theme.colors.background : theme.colors.backgroundAlt)};
  }
`

const MobileTokenIcon = styled(Box)<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: visible;
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  position: relative;
  z-index: ${({ isActive }) => (isActive ? 2 : 1)};

  ${({ isActive }) =>
    isActive &&
    `
    transform: scale(1.6) translateX(-8px);
  `}
`

const MobileTokenInfo = styled(Flex)`
  flex-direction: column;
  min-width: 0;
  flex: 1;
`

const MobileTokenName = styled(Text)<{ isActive: boolean }>`
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.2;
  color: ${({ theme, isActive }) => (isActive ? theme.colors.primary : theme.colors.textSubtle)};
  text-transform: uppercase;
  white-space: nowrap;
`

const MobileTokenPrice = styled(Box)<{ isActive: boolean }>`
  color: ${({ theme, isActive }) => (isActive ? theme.colors.text : theme.colors.textSubtle)};
  font-size: 0.75rem;
  line-height: 1.2;
  white-space: nowrap;
`

export const MobilePredictionTokenSelector: React.FC<MobilePredictionTokenSelectorProps> = ({
  tokens,
  onClickSwitchToken,
}) => {
  const config = useConfig()

  return (
    <MobileTabContainer>
      {tokens.map((token) => {
        const isActive = token.predictionCurrency.symbol === config?.predictionCurrency.symbol

        return (
          <MobileTabItem
            key={token.predictionCurrency.symbol}
            isActive={isActive}
            onClick={() => onClickSwitchToken(token.predictionCurrency.symbol)}
          >
            <MobileTokenIcon isActive={isActive}>
              <TokenImage
                width={24}
                height={24}
                token={token.predictionCurrency}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </MobileTokenIcon>
            {isActive && (
              <MobileTokenInfo>
                <MobileTokenName isActive={isActive}>{`${token.predictionCurrency.symbol}USD`}</MobileTokenName>
                <MobileTokenPrice isActive={isActive}>
                  <Price
                    fontSize="inherit"
                    color="inherit"
                    displayedDecimals={token.displayedDecimals}
                    chainlinkOracleAddress={token.chainlinkOracleAddress}
                    galetoOracleAddress={token.galetoOracleAddress}
                  />
                </MobileTokenPrice>
              </MobileTokenInfo>
            )}
          </MobileTabItem>
        )
      })}
    </MobileTabContainer>
  )
}
