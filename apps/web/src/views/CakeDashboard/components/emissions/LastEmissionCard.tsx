import { useTranslation } from '@pancakeswap/localization'
import { CardProps, Text } from '@pancakeswap/uikit'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const LastEmissionCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <StatsCardHeader>
        {t('Last Emission')}
        &nbsp;
        <span style={{ fontSize: '14px' }}>({t('Date Here')})</span>
      </StatsCardHeader>

      <Text fontSize="24px" bold>
        9.3m CAKE
      </Text>

      <Text fontSize="14px" color="textSubtle">
        2.037% of max supply
      </Text>
    </StatsCard>
  )
}
