import { Ifo } from '@pancakeswap/ifos'

import { useIdoPublicData } from './hooks/ido/useIdoPublicData'

import { IDoCurrentCard } from './components/IdoCards/IdoCards'
import IfoContainer from './components/IfoContainer'
import IfoQuestions from './components/IfoQuestions'
import { SectionBackground } from './components/SectionBackground'

interface TypeProps {
  activeIfo: Ifo
}

const CurrentIdo: React.FC<React.PropsWithChildren<TypeProps>> = ({ activeIfo }) => {
  const idoPublicData = useIdoPublicData(activeIfo.chainId)?.[0]

  const steps = <></>

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
