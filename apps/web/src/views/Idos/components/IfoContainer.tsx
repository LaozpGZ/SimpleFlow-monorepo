import { Container } from '@pancakeswap/uikit'
import { ReactNode } from 'react'
import { Address } from 'viem'

import IdoLayout, { IdoLayoutWrapper } from './IfoLayout'
import { SectionBackground } from './SectionBackground'

interface TypeProps {
  ifoSection: ReactNode
  ifoSteps: ReactNode
  faq?: ReactNode
  ifoAddress?: Address
}

const IfoContainer: React.FC<React.PropsWithChildren<TypeProps>> = ({ ifoSection }) => {
  return (
    <IdoLayout id="current-ido">
      <SectionBackground>
        <Container px="0">
          <IdoLayoutWrapper>{ifoSection}</IdoLayoutWrapper>
        </Container>
      </SectionBackground>
    </IdoLayout>
  )
}

export default IfoContainer
