import { Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

const InfoSectionWrapper = styled.div`
  position: relative;
  background: #faf9fa;
  min-height: 657px;

  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 160px;
  }
`
const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const InnerWrapper = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
`

export const InfoSection: React.FC = () => {
  return (
    <InfoSectionWrapper>
      <Wrapper>
        <InnerWrapper>
          <Text textAlign="center" fontSize="64px" bold color="secondary">
            126,280
          </Text>
        </InnerWrapper>
      </Wrapper>
    </InfoSectionWrapper>
  )
}
