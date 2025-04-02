import { useTranslation } from '@pancakeswap/localization'
import { CardProps, Text } from '@pancakeswap/uikit'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const MarketCapCard = (props: CardProps) => {
  const { t } = useTranslation()
  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('Market Cap')}</StatsCardHeader>
      <Text fontSize="26px" bold>
        $600M
      </Text>
      <Text color="textSubtle" small>
        {t('Market Cap = Price * Circulating Supply')}
      </Text>
    </StatsCard>
  )
}
