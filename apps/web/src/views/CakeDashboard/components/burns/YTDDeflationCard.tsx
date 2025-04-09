import { useTranslation } from '@pancakeswap/localization'
import { CardProps, FlexGap, InfoIcon, QuestionHelperV2, Text } from '@pancakeswap/uikit'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const YTDDeflationCard = (props: CardProps) => {
  const { t } = useTranslation()

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
        6%
      </Text>
      <Text fontSize="14px" color="textSubtle">
        of yyy supply
      </Text>
    </StatsCard>
  )
}
