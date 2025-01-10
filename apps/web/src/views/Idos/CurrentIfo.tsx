import { Ifo } from '@pancakeswap/ifos'
import { useMemo } from 'react'

import { useFetchIfo } from 'state/pools/hooks'
import { useIDOPoolInfo } from './hooks/ido/useIDOPoolInfo'
import { useIDOUserInfo } from './hooks/ido/useIDOUserInfo'
import { useIDOUserStatus } from './hooks/ido/useIDOUserStatus'
import { useIdoPublicData } from './hooks/ido/useIdoPublicData'

import IfoContainer from './components/IfoContainer'
import IfoQuestions from './components/IfoQuestions'
import IfoSteps from './components/IfoSteps'
import { SectionBackground } from './components/SectionBackground'
import { IDoCurrentCard } from './components/idoCard/idoCard'

interface TypeProps {
  activeIfo: Ifo
}

const CurrentIfo: React.FC<React.PropsWithChildren<TypeProps>> = ({ activeIfo }) => {
  useFetchIfo()
  const { data: idoPoolInfo } = useIDOPoolInfo()
  const idoUserStatus = useIDOUserStatus()
  const idoPublicData = useIdoPublicData(activeIfo.chainId)

  const isCommitted = useMemo(() => idoUserStatus?.stakedAmount?.greaterThan(0n) ?? false, [idoUserStatus])
  const isLive = useMemo(
    () =>
      idoPoolInfo?.startTimestamp !== undefined &&
      idoPoolInfo?.endTimestamp !== undefined &&
      Date.now() > idoPoolInfo.startTimestamp &&
      Date.now() < idoPoolInfo.endTimestamp,

    [idoPoolInfo?.startTimestamp, idoPoolInfo?.endTimestamp],
  )
  const isFinished = useMemo(
    () => idoPoolInfo?.endTimestamp !== undefined && Date.now() > idoPoolInfo.endTimestamp,
    [idoPoolInfo?.endTimestamp],
  )

  const { data: idoUserInfo } = useIDOUserInfo()

  const steps = (
    <IfoSteps
      ifoChainId={activeIfo.chainId}
      isLive={isLive}
      isFinished={isFinished}
      hasClaimed={idoUserInfo?.claimedPool ?? false}
      isCommitted={isCommitted}
      ifoCurrencyAddress={activeIfo.currency.address}
    />
  )

  const faq = (
    <SectionBackground padding="32px 0">
      <IfoQuestions />
    </SectionBackground>
  )

  return (
    <IfoContainer
      ifoAddress={activeIfo.address}
      ifoSection={<IDoCurrentCard chainId={activeIfo.chainId} idoPublicData={idoPublicData} idoId={activeIfo.id} />}
      ifoSteps={steps}
      faq={faq}
    />
  )
}

export default CurrentIfo
