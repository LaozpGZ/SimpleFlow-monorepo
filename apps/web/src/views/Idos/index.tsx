import { styled } from 'styled-components'
import Hero from './components/Hero'
import IfoProvider from './contexts/IfoContext'

export const Wrapper = styled.div`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  padding: 16px;
`

const WidthWrapper = styled.div`
  max-width: 450px;
  margin: 0 auto;
`

export const IdoPageLayout = ({ children }) => {
  return (
    <IfoProvider>
      <Wrapper>
        <WidthWrapper>
          <Hero />
          {children}
        </WidthWrapper>
      </Wrapper>
    </IfoProvider>
  )
}
