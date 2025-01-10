import { ChainId } from '@pancakeswap/chains'
import { Box, Card, CardBody, CardFooter, CardHeader, useMatchBreakpoints } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { getBannerUrl } from '../../helpers'
import { IdoRibbon } from './IdoRibbon'

import { IDOPublicData } from '../../hooks/ido/useIdoPublicData'
import {} from '../IfoFoldableCard/IfoPoolCard'

const StyledCard = styled(Card)<{ $isCurrent?: boolean }>`
  width: 100%;
  margin: auto;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;

  ${({ $isCurrent }) =>
    $isCurrent &&
    `
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  > div {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  `}

  > div {
    background: ${({ theme, $isCurrent }) => ($isCurrent ? theme.colors.gradientBubblegum : theme.colors.dropdown)};
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    border-top-left-radius: 32px;
    border-top-right-radius: 32px;

    > div {
      border-top-left-radius: 32px;
      border-top-right-radius: 32px;
    }
  }
`

const Header = styled(CardHeader)<{ ifoId: string; $isCurrent?: boolean }>`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: ${({ $isCurrent }) => ($isCurrent ? '64px' : '112px')};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  background-color: ${({ theme }) => theme.colors.dropdown};
  background-image: ${({ ifoId }) => `url('${getBannerUrl(ifoId)}')`};
  ${({ theme }) => theme.mediaQueries.md} {
    height: 112px;
  }
`

export const StyledCardBody = styled(CardBody)`
  padding: 24px 16px;
  ${({ theme }) => theme.mediaQueries.md} {
    padding: 24px;
  }
`

const StyledCardFooter = styled(CardFooter)`
  padding: 0;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  text-align: center;
`

export const IDoCurrentCard = ({
  idoPublicData,
  chainId,
  idoId,
}: {
  idoPublicData: IDOPublicData
  chainId: ChainId
  idoId: string
}) => {
  const { isMobile } = useMatchBreakpoints()

  return (
    <>
      {isMobile && (
        <Box
          className="sticky-header"
          position="sticky"
          bottom="48px"
          width="100%"
          zIndex={6}
          maxWidth={['400px', '400px', '400px', '100%']}
        >
          <Header $isCurrent ifoId={idoId} />
          <IdoRibbon
            ifoId={idoId}
            startTime={idoPublicData.startTime}
            plannedStartTime={idoPublicData.plannedStartTime}
            timeProgress={idoPublicData.timeProgress}
            ifoStatus={idoPublicData.status}
            ifoChainId={chainId}
          />
        </Box>
      )}
      <Box position="relative" width="100%" maxWidth={['400px', '400px', '400px', '400px', '400px', '100%']}>
        <StyledCard $isCurrent>
          {!isMobile && (
            <>
              <Header $isCurrent ifoId={idoId} />
              <IdoRibbon
                ifoId={idoId}
                startTime={idoPublicData.startTime}
                plannedStartTime={idoPublicData.plannedStartTime}
                timeProgress={idoPublicData.timeProgress}
                ifoStatus={idoPublicData.status}
                ifoChainId={chainId}
              />
            </>
          )}
          {/* <IfoCard ifo={ifo} publicIfoData={publicIfoData} walletIfoData={walletIfoData} /> */}
          <StyledCardFooter>
            {/* <ExpandableLabel expanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? t('Hide') : t('Details')}
            </ExpandableLabel>
            {isExpanded && <IfoAchievement ifo={ifo} publicIfoData={publicIfoData} />} */}
          </StyledCardFooter>
        </StyledCard>
      </Box>
    </>
  )
}
