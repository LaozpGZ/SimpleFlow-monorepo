import { useTranslation } from '@pancakeswap/localization'
import { CardProps, Flex, FlexGap, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { ProgressBar } from 'components/Progress/ProgressBar'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const LastBurnCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('Last Burn (date here)')}</StatsCardHeader>

      <LightGreyCard mt="8px" padding="16px">
        <FlexGap alignItems="center" justifyContent="space-between">
          <Text fontSize="18px" bold>
            10M CAKE
          </Text>
          <Text fontSize="16px" color="textSubtle">
            2.22% of max. supply
          </Text>
        </FlexGap>

        <Text mt="8px" small>
          <span style={{ fontWeight: 600 }}>2.22%</span> per year
        </Text>
        <ProgressBar
          mt="8px"
          min={0}
          max={100}
          progress={50}
          backgroundColor="secondary20"
          fillColor="primary60"
          height="8px"
        />
        <Flex mt="8px" justifyContent="space-between">
          <Text color="textSubtle" fontSize="12px">
            0 CAKE
          </Text>
          <Text color="textSubtle" fontSize="12px">
            520M CAKE
          </Text>
        </Flex>
      </LightGreyCard>
    </StatsCard>
  )
}
