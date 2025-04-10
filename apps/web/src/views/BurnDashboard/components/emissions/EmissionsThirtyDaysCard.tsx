import { useTranslation } from '@pancakeswap/localization'
import { CardProps, Text } from '@pancakeswap/uikit'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const EmissionsThirtyDaysCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('Emissions (in last 30d)')}</StatsCardHeader>

      <Text fontSize="24px" bold>
        40.02m CAKE
      </Text>

      <Text fontSize="14px" color="textSubtle">
        10.927% of max supply
      </Text>
    </StatsCard>
  )
}
