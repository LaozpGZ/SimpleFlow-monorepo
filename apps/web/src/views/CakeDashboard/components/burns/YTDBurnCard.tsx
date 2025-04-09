import { useTranslation } from '@pancakeswap/localization'
import { CardProps, Text } from '@pancakeswap/uikit'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const YTDBurnCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('YTD Burn')}</StatsCardHeader>
      TODO when weekly burn chart
      <Text fontSize="24px" bold>
        100.92m CAKE
      </Text>
      <Text fontSize="14px" color="textSubtle">
        ~$234,937,842.04
      </Text>
    </StatsCard>
  )
}
