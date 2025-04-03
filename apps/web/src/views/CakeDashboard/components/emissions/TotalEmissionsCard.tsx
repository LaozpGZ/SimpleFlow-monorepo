import { useTranslation } from '@pancakeswap/localization'
import { CardProps, Text } from '@pancakeswap/uikit'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const TotalEmissionsCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <StatsCardHeader>
        {t('Total Emissions')}
        &nbsp;
        <span style={{ fontSize: '14px' }}>({t('Since inception')})</span>
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
