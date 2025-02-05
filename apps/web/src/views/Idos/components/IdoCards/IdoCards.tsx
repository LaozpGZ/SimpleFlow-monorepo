import { Box, Card, CardBody, CardHeader, FlexGap } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

import { useIDOStatus } from 'views/Idos/hooks/ido/usdIDOStatus'
import { useIDOConfig } from 'views/Idos/hooks/ido/useIDOConfig'
import { useIDOPoolInfo } from 'views/Idos/hooks/ido/useIDOPoolInfo'
import { useIDOUserStatus } from 'views/Idos/hooks/ido/useIDOUserStatus'
import { getBannerUrl, getTempBannerUrl } from '../../helpers'
import { Footer } from '../Footer'
import { IdoRibbon } from './IdoRibbon'
import { IdoSaleInfoCard } from './IdoSaleInfoCard'
import { IdoStakeActionCard } from './IdoStakeActionCard'

export const StyledCardBody = styled(CardBody)`
  padding: 24px 16px;
  ${({ theme }) => theme.mediaQueries.md} {
    padding: 24px;
  }
`

const Header = styled(CardHeader)<{ idoId: string; $isCurrent?: boolean }>`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: ${({ $isCurrent }) => ($isCurrent ? '64px' : '112px')};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: ${({ theme }) => theme.colors.dropdown};
  background-image: ${({ idoId }) => `url('${getBannerUrl(idoId)}')`};
  /* background-image: url('${getTempBannerUrl()}'); */
`

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.cardBorder};
  margin: 8px 0 0 0;
`

export const IDoCurrentCard = ({ idoId }: { idoId: string }) => {
  const { status, duration, startTimestamp, endTimestamp } = useIDOConfig()
  const [userStatus0, userStatus1] = useIDOUserStatus()
  const hasUserStaked = userStatus0.stakedAmount?.greaterThan(0) || userStatus1.stakedAmount?.greaterThan(0)
  const isClaimed =
    userStatus0.stakedAmount?.greaterThan(0) &&
    userStatus0.claimed &&
    userStatus1.stakedAmount?.greaterThan(0) &&
    userStatus1.claimed

  return (
    <Card style={{ width: '100%' }}>
      <Box className="sticky-header" position="sticky" bottom="48px" width="100%" zIndex={6}>
        <Header $isCurrent idoId={idoId} />
        <IdoRibbon
          startTime={startTimestamp}
          plannedStartTime={startTimestamp - duration}
          ifoStatus={status}
          endTime={endTimestamp}
          hasUserStaked={hasUserStaked}
          isClaimed={isClaimed}
        />
        <IdoCard />
      </Box>
      <Footer />
    </Card>
  )
}

export const IdoCard: React.FC = () => {
  const { data: poolInfo } = useIDOPoolInfo()
  const { pool0Info, pool1Info } = poolInfo ?? {}
  const [userStatus0, userStatus1] = useIDOUserStatus()
  const [idoStatus0, idoStatus1] = useIDOStatus()

  return (
    <CardBody>
      <IdoSaleInfoCard />
      <FlexGap flexDirection="column" gap="16px">
        {pool0Info && <IdoStakeActionCard userStatus={userStatus0} idoStatus={idoStatus0} />}
        {pool1Info && <IdoStakeActionCard userStatus={userStatus1} idoStatus={idoStatus1} />}
      </FlexGap>
    </CardBody>
  )
}
