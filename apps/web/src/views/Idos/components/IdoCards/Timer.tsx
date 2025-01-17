import { IfoStatus } from '@pancakeswap/ifos'
import { useTranslation } from '@pancakeswap/localization'
import { Flex, Heading, PocketWatchIcon, Skeleton, Text, TimerIcon } from '@pancakeswap/uikit'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import useTheme from 'hooks/useTheme'
import { styled } from 'styled-components'

interface Props {
  plannedStartTime: number
  startTime: number
  endTime: number
  ifoStatus: IfoStatus
  dark?: boolean
}

const GradientText = styled(Heading)`
  background: -webkit-linear-gradient(#ffd800, #eb8c00);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-text-stroke: 1px rgba(0, 0, 0, 0.5);
`

const FlexGap = styled(Flex)<{ gap: string }>`
  gap: ${({ gap }) => gap};
`

const USE_BLOCK_TIMESTAMP_UNTIL = 3

export const SoonTimer: React.FC<React.PropsWithChildren<Props>> = ({ startTime, ifoStatus, plannedStartTime }) => {
  const { theme } = useTheme()
  const { t } = useTranslation()

  const now = Math.floor(Date.now() / 1000)
  const hoursLeft = plannedStartTime && now ? (plannedStartTime - Number(now)) / 3600 : 0
  const fallbackToBlockTimestamp = hoursLeft > USE_BLOCK_TIMESTAMP_UNTIL
  let timeUntil: ReturnType<typeof getTimePeriods> | undefined
  if (fallbackToBlockTimestamp) {
    timeUntil = getTimePeriods((plannedStartTime || Number(now)) - Number(now))
  } else {
    timeUntil = getTimePeriods(startTime - now)
  }
  const textColor = theme.colors.secondary

  const countdownDisplay =
    ifoStatus !== 'idle' ? (
      <>
        <FlexGap gap="8px" alignItems="center">
          <Text fontSize="16px" color={textColor}>
            {t('Starts in')}:
          </Text>
          <FlexGap gap="4px" alignItems="baseline">
            {timeUntil.days ? (
              <Text fontSize="20px" bold color={textColor}>
                {timeUntil.days}
                {t('d')} :
              </Text>
            ) : null}
            {timeUntil.days || timeUntil.hours ? (
              <Text fontSize="20px" bold color={textColor}>
                {timeUntil.hours}
                {t('h')} :
              </Text>
            ) : null}
            <Text fontSize="20px" bold color={textColor}>
              {!timeUntil.days && !timeUntil.hours && timeUntil.minutes === 0 ? '< 1' : timeUntil.minutes}
              {t('m')}
            </Text>
          </FlexGap>
        </FlexGap>
      </>
    ) : null

  const countdown = countdownDisplay

  return (
    <Flex justifyContent="center" position="relative">
      {ifoStatus === 'idle' ? <Skeleton animation="pulse" variant="rect" width="100%" height="48px" /> : countdown}
    </Flex>
  )
}

const EndInHeading = styled(Heading)`
  color: white;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.1;

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 24px;
  }
`

const LiveNowHeading = styled(EndInHeading)`
  color: white;
  ${({ theme }) => theme.mediaQueries.md} {
    background: -webkit-linear-gradient(#ffd800, #eb8c00);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    -webkit-text-stroke: 1px rgba(0, 0, 0, 0.5);
  }
`

const LiveTimer: React.FC<React.PropsWithChildren<Pick<Props, 'endTime' | 'ifoStatus'>>> = ({ endTime, ifoStatus }) => {
  const { t } = useTranslation()
  const now = Math.floor(Date.now() / 1000)
  const timeUntil = getTimePeriods(endTime - now)

  const timeDisplay =
    ifoStatus !== 'idle' ? (
      <>
        <PocketWatchIcon width="42px" mr="8px" />
        <FlexGap gap="8px" alignItems="center">
          <LiveNowHeading textTransform="uppercase" as="h3">{`${t('Live Now')}!`}</LiveNowHeading>
          <EndInHeading as="h3" scale="lg" color="white">
            {t('Ends in')}
          </EndInHeading>
          <FlexGap gap="4px" alignItems="baseline">
            {timeUntil.days ? (
              <>
                <GradientText scale="lg">{timeUntil.days}</GradientText>
                <Text color="white">{t('d')}</Text>
              </>
            ) : null}
            {timeUntil.days || timeUntil.hours ? (
              <>
                <GradientText scale="lg">{timeUntil.hours}</GradientText>
                <Text color="white">{t('h')}</Text>
              </>
            ) : null}
            <>
              <GradientText scale="lg">
                {!timeUntil.days && !timeUntil.hours && timeUntil.minutes === 0 ? '< 1' : timeUntil.minutes}
              </GradientText>
              <Text color="white">{t('m')}</Text>
            </>
          </FlexGap>
        </FlexGap>
        <TimerIcon ml="4px" color="white" />
      </>
    ) : null

  const timeNode = timeDisplay

  return (
    <Flex justifyContent="center" position="relative">
      {ifoStatus === 'idle' ? <Skeleton animation="pulse" variant="rect" width="100%" height="48px" /> : timeNode}
    </Flex>
  )
}

export default LiveTimer
