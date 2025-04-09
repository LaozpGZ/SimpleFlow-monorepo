import { useTranslation } from '@pancakeswap/localization'
import { CardProps, Text } from '@pancakeswap/uikit'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const EmissionsLastSevenDaysCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <StatsCardHeader>
        {t('Emissions')}
        &nbsp;
        <span style={{ fontSize: '14px' }}>({t('In last 7d')})</span>
      </StatsCardHeader>

      <Text fontSize="24px" bold>
        100.92m CAKE
      </Text>
      <Text fontSize="14px" color="textSubtle">
        ~$234,937,842.04
      </Text>
    </StatsCard>
  )
}
