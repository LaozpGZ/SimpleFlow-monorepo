import { useTranslation } from '@pancakeswap/localization'
import { CardProps, Text } from '@pancakeswap/uikit'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const FDVCard = (props: CardProps) => {
  const { t } = useTranslation()
  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('FDV')}</StatsCardHeader>
      <Text fontSize="26px" bold>
        $900M
      </Text>
      <Text color="textSubtle" small>
        {t('FDV = Price * Max Supply')}
      </Text>
    </StatsCard>
  )
}
