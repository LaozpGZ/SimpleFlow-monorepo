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
      {/* <Container px="0">
        <IfoLayoutWrapper>{ifoSection}</IfoLayoutWrapper>
      </Container> */}
      <SectionBackground>
        <Container px="0">
          <IfoLayoutWrapper>{ifoSection}</IfoLayoutWrapper>
        </Container>
      </SectionBackground>
      {/* {faq}
      <LinkExternal
        href="https://docs.pancakeswap.finance/ecosystem-and-partnerships/business-partnerships/initial-farm-offerings-ifos"
        mx="auto"
        mt="16px"
      >
        {t('Apply to run an IFO!')}
      </LinkExternal> */}
    </IfoLayout>
  )
}

export default IfoContainer
