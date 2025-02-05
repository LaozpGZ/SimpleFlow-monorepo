import type { IDOConfig } from './config'

import { IDoCurrentCard } from './components/IdoCards/IdoCards'
import IfoContainer from './components/IfoContainer'
import IfoQuestions from './components/IfoQuestions'
import { SectionBackground } from './components/SectionBackground'

interface TypeProps {
  idoConfig: IDOConfig
}

const CurrentIdo: React.FC<React.PropsWithChildren<TypeProps>> = ({ idoConfig }) => {
  const steps = <></>

  const faq = (
    <SectionBackground padding="32px 0">
      <IfoQuestions />
    </SectionBackground>
  )

  return (
    <IfoContainer ifoAddress="0x" ifoSection={<IDoCurrentCard idoId={idoConfig.id} />} ifoSteps={steps} faq={faq} />
  )
}

export default CurrentIdo
