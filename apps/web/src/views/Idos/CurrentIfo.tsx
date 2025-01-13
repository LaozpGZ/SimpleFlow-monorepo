import { Ifo } from '@pancakeswap/ifos'
import { useMemo } from 'react'

import { useIDOPoolInfo } from './hooks/ido/useIDOPoolInfo'
import { useIDOUserInfo } from './hooks/ido/useIDOUserInfo'
import { useIDOUserStatus } from './hooks/ido/useIDOUserStatus'
import { useIdoPublicData } from './hooks/ido/useIdoPublicData'

import { IDoCurrentCard } from './components/IdoCards/IdoCards'
import IfoContainer from './components/IfoContainer'
import IfoQuestions from './components/IfoQuestions'
import IfoSteps from './components/IfoSteps'
import { SectionBackground } from './components/SectionBackground'

interface TypeProps {
  activeIfo: Ifo
}

const CurrentIdo: React.FC<React.PropsWithChildren<TypeProps>> = ({ activeIfo }) => {
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

export default CurrentIdo
