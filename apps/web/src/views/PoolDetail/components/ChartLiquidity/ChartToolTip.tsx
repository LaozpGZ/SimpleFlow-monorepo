import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { Flex, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from 'components/Logo'
import styled from 'styled-components'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'

const TooltipCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 16px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  z-index: 10;
`

const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }
`

interface CustomToolTipProps {
  currency0?: Currency
  currency1?: Currency
  price0?: `${number}`
  price1?: `${number}`
  tvlToken0?: number
  tvlToken1?: number
  currentPrice: number | undefined
  activeLiquidity?: number
  isCurrent?: boolean
}

export const ChartToolTip: React.FC<CustomToolTipProps> = ({
  price0,
  tvlToken0,
  tvlToken1,
  currentPrice,
  currency0,
  currency1,
}) => {
  const { t } = useTranslation()
  const symbol0 = currency0?.symbol || 'TOKEN1'
  const symbol1 = currency1?.symbol || 'TOKEN2'

  const totalLiquidityUSD = tvlToken0 && tvlToken1 ? tvlToken0 + tvlToken1 : 0
  const token0ValueUSD = tvlToken0 || 0
  const token1ValueUSD = tvlToken1 || 0

  // Safely convert currentPrice to number and handle edge cases
  const getDisplayPrice = () => {
    if (currentPrice && typeof currentPrice === 'number' && !Number.isNaN(currentPrice)) {
      return currentPrice.toFixed(2)
    }
    if (price0) {
      const numPrice = Number(price0)
      return !Number.isNaN(numPrice) ? numPrice.toFixed(2) : '0'
    }
    return '0'
  }

  return (
    <TooltipCard>
      <TooltipRow>
        <Text bold color="textSubtle">
          {t('Price')}
        </Text>
        <Text bold>
          {getDisplayPrice()} {symbol0} per {symbol1}
        </Text>
      </TooltipRow>

      <TooltipRow>
        <Text bold color="textSubtle">
          {t('Liquidity')}
        </Text>
        <Text bold>{formatDollarAmount(totalLiquidityUSD)}</Text>
      </TooltipRow>

      <TooltipRow>
        <Flex alignItems="center">
          <CurrencyLogo currency={currency0} size="20px" style={{ marginRight: '8px' }} />
          <Text bold>
            {symbol0} {t('Locked')}
          </Text>
        </Flex>
        <Text bold>{formatDollarAmount(token0ValueUSD)}</Text>
      </TooltipRow>

      <TooltipRow>
        <Flex alignItems="center">
          <CurrencyLogo currency={currency1} size="20px" style={{ marginRight: '8px' }} />
          <Text bold>
            {symbol1} {t('Locked')}
          </Text>
        </Flex>
        <Text bold>{formatDollarAmount(token1ValueUSD)}</Text>
      </TooltipRow>
    </TooltipCard>
  )
}
