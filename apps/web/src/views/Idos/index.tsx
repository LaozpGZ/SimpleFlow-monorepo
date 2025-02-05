import { styled } from 'styled-components'
import Hero from './components/Hero'

export const Wrapper = styled.div`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  padding: 16px;
  min-height: 100vh;
`

const WidthWrapper = styled.div`
  max-width: 450px;
  margin: 0 auto;
`

export const IdoPageLayout = ({ children }) => {
  return (
    <Wrapper>
      <WidthWrapper>
        <Hero />
        {children}
      </WidthWrapper>
    </Wrapper>
  )
}
