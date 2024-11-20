import { styled } from 'styled-components'
import { Hero } from './Hero'
import { InfoSection } from './InfoSection'
import { MevIntroSection } from './MevIntroSection'

export const Wrapper = styled.div``

export const MevLanding: React.FC = () => {
  return (
    <Wrapper>
      <Hero />
      <MevIntroSection />
      <InfoSection />
    </Wrapper>
  )
}
