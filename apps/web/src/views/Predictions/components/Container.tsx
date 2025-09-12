import { memo } from 'react'
import { styled } from 'styled-components'

const Container = styled.div`
  background: ${({ theme }) => theme.colors.gradientVioletAlt};

  ${({ theme }) => theme.mediaQueries.lg} {
    height: calc(100vh - 115px);
  }

  overflow: hidden;
`

export default memo(Container)
