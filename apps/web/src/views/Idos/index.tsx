import { styled } from 'styled-components'
import Hero from './components/Hero'
import IfoProvider from './contexts/IfoContext'

export const Wrapper = styled.div`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  padding: 16px;
`

export const IdoPageLayout = ({ children }) => {
  return (
    <IfoProvider>
      <Wrapper>
        <Hero />
        {children}
      </Wrapper>
    </IfoProvider>
  )
}
