import { useTranslation } from '@pancakeswap/localization'
import { CardProps } from '@pancakeswap/uikit'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const CumulativeDeflation = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('Cumulative Deflation')}</StatsCardHeader>
    </StatsCard>
  )
}
