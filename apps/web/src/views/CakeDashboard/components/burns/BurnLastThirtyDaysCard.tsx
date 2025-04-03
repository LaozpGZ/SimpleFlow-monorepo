import { useTranslation } from '@pancakeswap/localization'
import { CardProps, Text } from '@pancakeswap/uikit'
import { LightTertiaryCard } from 'components/Card'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const BurnLastThirtyDaysCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('Burn (in last 30d)')}</StatsCardHeader>

      <Text fontSize="24px" bold>
        50M CAKE
      </Text>
      <Text fontSize="14px" color="textSubtle">
        10% of supply
      </Text>

      <LightTertiaryCard mt="8px" active={false} padding="16px">
        <Text fontSize="14px" color="textSubtle">
          {t('Estimated Yearly Deflation')}
        </Text>
        <Text fontSize="24px" bold>
          600M CAKE
        </Text>
      </LightTertiaryCard>
    </StatsCard>
  )
}
