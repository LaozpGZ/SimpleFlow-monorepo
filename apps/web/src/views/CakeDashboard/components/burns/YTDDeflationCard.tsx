import { useTranslation } from '@pancakeswap/localization'
import { CardProps, FlexGap, InfoIcon, QuestionHelperV2, Text } from '@pancakeswap/uikit'
import { formatAmount } from 'utils/formatInfoNumbers'
import { TOTAL_SUPPLY_YTD } from 'views/CakeDashboard/constants'
import { useBurnStats } from 'views/CakeDashboard/hooks/useBurnStats'
import { getBurnInfoPrecision } from 'views/CakeDashboard/utils'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const YTDDeflationCard = (props: CardProps) => {
  const { t } = useTranslation()

  const { data } = useBurnStats()

  const totalSupply = data?.total_supply || 0
  const ytdDeflation = TOTAL_SUPPLY_YTD - totalSupply
  const ytdDeflationOfTotalSupplyPercentage = (ytdDeflation / TOTAL_SUPPLY_YTD) * 100

  return (
    <StatsCard {...props}>
      <StatsCardHeader>
        <FlexGap alignItems="center" gap="4px">
          {t('YTD Deflation')}
          <QuestionHelperV2
            text={t('Year-to-date (YTD) deflation: % decrease in CAKE supply since start of the year')}
            placement="top"
          >
            <InfoIcon color="textSubtle" />
          </QuestionHelperV2>
        </FlexGap>
      </StatsCardHeader>

      <Text fontSize="24px" bold>
        {ytdDeflationOfTotalSupplyPercentage.toFixed(2)}%
      </Text>
      <Text fontSize="14px" color="textSubtle">
        of {formatAmount(totalSupply, { precision: getBurnInfoPrecision(totalSupply) })} CAKE supply
      </Text>
    </StatsCard>
  )
}
