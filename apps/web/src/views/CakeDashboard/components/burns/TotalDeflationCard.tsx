import { useTranslation } from '@pancakeswap/localization'
import { Box, CardProps, Flex, FlexGap, InfoIcon, QuestionHelperV2, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { ProgressBar } from 'components/Progress/ProgressBar'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const TotalDeflationCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <FlexGap alignItems="center" gap="4px">
        <StatsCardHeader>{t('Total Deflation (Since peak supply)')}</StatsCardHeader>
        <QuestionHelperV2 text={t('Total Deflation = Peak CAKE Supply - Current CAKE Supply')} placement="top">
          <InfoIcon color="textSubtle" />
        </QuestionHelperV2>
      </FlexGap>
      <LightGreyCard mt="8px" padding="16px">
        <Text fontSize="18px" bold>
          10M CAKE
        </Text>

        <Text mt="16px" color="textSubtle" small>
          <Box as="span" color="text" style={{ fontWeight: 600 }}>
            2.22%
          </Box>{' '}
          {t('of peak CAKE supply')}
        </Text>
        <ProgressBar
          mt="8px"
          min={0}
          max={100}
          progress={50}
          backgroundColor="secondary20"
          fillColor="success"
          height="8px"
        />
        <Flex mt="8px" justifyContent="space-between">
          <Text color="textSubtle" fontSize="12px">
            0%
          </Text>
          <Text color="textSubtle" fontSize="12px">
            100%
          </Text>
        </Flex>
      </LightGreyCard>
    </StatsCard>
  )
}
