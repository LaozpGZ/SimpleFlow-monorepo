import { useTranslation } from '@pancakeswap/localization'
import { CardProps } from '@pancakeswap/uikit'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const SupplyDeflationCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('Supply & Deflation')}</StatsCardHeader>
    </StatsCard>
  )
}
