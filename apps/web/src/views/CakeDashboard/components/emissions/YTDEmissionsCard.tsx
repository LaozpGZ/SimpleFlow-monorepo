import { useTranslation } from '@pancakeswap/localization'
import { CardProps, FlexGap, Text } from '@pancakeswap/uikit'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const YTDEmissionsCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <FlexGap justifyContent="space-between" alignItems="center">
        <StatsCardHeader>{t('YTD Emissions')}</StatsCardHeader>
      </FlexGap>

      <Text fontSize="24px" bold>
        9.3m CAKE
      </Text>

      <Text fontSize="14px" color="textSubtle">
        2.037% of max supply
      </Text>
    </StatsCard>
  )
}
