import { useImageColor } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { ChainId } from '@pancakeswap/sdk'
import { Box, Flex, Heading, Progress, ProgressBar } from '@pancakeswap/uikit'
import { ReactNode, useMemo } from 'react'
import { styled } from 'styled-components'

import { IfoStatus } from '@pancakeswap/ifos'
import { getBannerUrl } from '../../helpers'
import { PublicIfoData } from '../../types'
import { IfoChainBoard } from '../IfoChainBoard'
import LiveTimer, { SoonTimer } from './Timer'

const StyledProgress = styled(Progress)`
  background-color: #281a5b;
`

const Container = styled(Box)`
  position: relative;
`

const BigCurve = styled(Box)<{ $status?: PublicIfoData['status']; $dark?: boolean }>`
  width: 150%;
  position: absolute;
  top: -150%;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;

  ${({ theme }) => theme.mediaQueries.md} {
    border-radius: 50%;
  }

  ${({ $status, $dark, theme }) => {
    switch ($status) {
      case 'coming_soon':
        return `
          background: ${$dark ? '#353547' : '#EFF3F4'};
        `
      case 'live':
        return `
          background: linear-gradient(180deg, #8051D6 0%, #492286 100%);
        `
      case 'finished':
        return `
          background: ${theme.colors.input};
        `
      default:
        return ''
    }
  }}
`

const RibbonContainer = styled(Box)`
  z-index: 2;
  position: relative;
`

const ChainBoardContainer = styled(Box)`
  position: absolute;
  top: -4rem;
  left: 50%;

  ${({ theme }) => theme.mediaQueries.sm} {
    left: unset;
    top: unset;
    right: 90px;
    bottom: 3px;
  }
`

export const IdoRibbon = ({
  ifoId,
  ifoChainId,
  ifoStatus,
  plannedStartTime,
  startTime,
  timeProgress,
}: {
  ifoChainId?: ChainId
  ifoStatus: IfoStatus
  ifoId?: string
  plannedStartTime: number
  startTime: number
  timeProgress: number
}) => {
  const bannerUrl = useMemo(() => ifoId && getBannerUrl(ifoId), [ifoId])
  const { isDarkColor } = useImageColor({ url: bannerUrl })

  let ribbon: ReactNode = null
  switch (ifoStatus) {
    case 'finished':
      ribbon = <IfoRibbonEnd />
      break
    case 'live':
      ribbon = <IfoRibbonLive startTime={startTime} ifoStatus={ifoStatus} dark={isDarkColor} />
      break
    case 'coming_soon':
      ribbon = (
        <IfoRibbonSoon
          startTime={startTime}
          ifoStatus={ifoStatus}
          plannedStartTime={plannedStartTime}
          dark={isDarkColor}
        />
      )
      break
    default:
      ribbon = null
  }

  if (ifoStatus === 'idle') {
    return null
  }

  return (
    <Container>
      {ifoStatus === 'live' && (
        <StyledProgress variant="flat">
          <ProgressBar
            $useDark
            $background="linear-gradient(273deg, #ffd800 -2.87%, #eb8c00 113.73%)"
            style={{ width: `${Math.min(Math.max(timeProgress, 0), 100)}%` }}
          />
        </StyledProgress>
      )}
      <Flex
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        minHeight={['48px', '48px', '48px', '75px']}
        position="relative"
        overflow="hidden"
        zIndex={1}
      >
        {ribbon}
      </Flex>
      <ChainBoardContainer zIndex={2}>
        <IfoChainBoard chainId={ifoChainId} />
      </ChainBoardContainer>
    </Container>
  )
}

type RibbonProps = {
  dark?: boolean
}

const IfoRibbonEnd = () => {
  const { t } = useTranslation()
  return (
    <>
      <BigCurve $status="finished" />
      <RibbonContainer>
        <Heading as="h3" scale="lg" color="textSubtle">
          {t('Sale Finished!')}
        </Heading>
      </RibbonContainer>
    </>
  )
}

const IfoRibbonSoon = ({
  startTime,
  ifoStatus,
  plannedStartTime,
  dark,
}: { plannedStartTime: number; startTime: number; ifoStatus: IfoStatus } & RibbonProps) => {
  return (
    <>
      <BigCurve $status="coming_soon" $dark={dark} />
      <RibbonContainer>
        <Heading as="h3" scale="lg" color="secondary">
          <SoonTimer startTime={startTime} ifoStatus={ifoStatus} plannedStartTime={plannedStartTime} dark={dark} />
        </Heading>
      </RibbonContainer>
    </>
  )
}

const IfoRibbonLive = ({ startTime, ifoStatus, dark }: { startTime: number; ifoStatus: IfoStatus } & RibbonProps) => {
  return (
    <>
      <BigCurve $status="live" $dark={dark} />
      <RibbonContainer>
        <LiveTimer startTime={startTime} ifoStatus={ifoStatus} />
      </RibbonContainer>
    </>
  )
}
