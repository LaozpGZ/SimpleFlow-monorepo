import { useTranslation } from '@pancakeswap/localization'
import { Box, CardProps, Flex, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { ProgressBar } from 'components/Progress/ProgressBar'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const BurnLastSevenDaysCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('Burn (In last 7d)')}</StatsCardHeader>

      <LightGreyCard mt="8px" padding="16px">
        <Text fontSize="18px" bold>
          10M CAKE
        </Text>

        <Text mt="16px" color="textSubtle" small>
          <Box as="span" color="text" style={{ fontWeight: 600 }}>
            2.22%
          </Box>{' '}
          {t('of total CAKE supply')}
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
