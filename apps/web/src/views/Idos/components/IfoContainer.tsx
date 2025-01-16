import { Container } from '@pancakeswap/uikit'
import { ReactNode } from 'react'
import { Address } from 'viem'

import IfoLayout, { IfoLayoutWrapper } from './IfoLayout'
import { SectionBackground } from './SectionBackground'

interface TypeProps {
  ifoSection: ReactNode
  ifoSteps: ReactNode
  faq?: ReactNode
  ifoAddress?: Address
}

const IfoContainer: React.FC<React.PropsWithChildren<TypeProps>> = ({ ifoSection, ifoSteps, faq }) => {
  return (
    <IfoLayout id="current-ido">
      <SectionBackground>
        <Container px="0">
          <IfoLayoutWrapper>{ifoSection}</IfoLayoutWrapper>
        </Container>
      </SectionBackground>
    </IfoLayout>
  )
}

export default IfoContainer
