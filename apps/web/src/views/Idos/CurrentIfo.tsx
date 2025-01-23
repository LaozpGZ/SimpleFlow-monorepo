import { IDOConfig } from './config'

import { useIdoPublicData } from './hooks/ido/useIdoPublicData'

import { IDoCurrentCard } from './components/IdoCards/IdoCards'
import IfoContainer from './components/IfoContainer'
import IfoQuestions from './components/IfoQuestions'
import { SectionBackground } from './components/SectionBackground'

interface TypeProps {
  activeIdo: IDOConfig
}

const CurrentIdo: React.FC<React.PropsWithChildren<TypeProps>> = ({ activeIdo }) => {
  const idoPublicData = useIdoPublicData(activeIdo.chainId)?.[0]

  const steps = <></>

  const faq = (
    <SectionBackground padding="32px 0">
      <IfoQuestions />
    </SectionBackground>
  )

  return (
    <IfoContainer
      ifoAddress="0x"
      ifoSection={<IDoCurrentCard chainId={activeIdo.chainId} idoPublicData={idoPublicData} idoId={activeIdo.id} />}
      ifoSteps={steps}
      faq={faq}
    />
  )
}

export default CurrentIdo
