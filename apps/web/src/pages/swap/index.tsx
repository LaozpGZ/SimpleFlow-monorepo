import { Box, Skeleton, useMatchBreakpoints } from '@pancakeswap/uikit'
import dynamic from 'next/dynamic'
import styled from 'styled-components'
import { CHAIN_IDS } from 'utils/wagmi'
import SwapLayout from 'views/Swap/SwapLayout'

const StyledSkeleton = styled(Skeleton)`
  background: ${({ theme }) => theme.colors.bubblegum};
  opacity: 0.1;
`
const BgBox = styled(Box)`
  background: ${({ theme }) => theme.colors.bubblegum};
`
const Swap = dynamic(() => import('views/SwapSimplify'), {
  ssr: false,
  loading: () => (
    <BgBox
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <StyledSkeleton
        variant="rect"
        animation="waves"
        style={{
          height: '100vh',
        }}
      />
    </BgBox>
  ),
})

const SwapPage = () => {
  const { isMobile } = useMatchBreakpoints()

  return (
    <SwapLayout>
      <div
        style={{
          minHeight: isMobile ? '100vh' : undefined,
        }}
      >
        <Swap />
      </div>
    </SwapLayout>
  )
}

SwapPage.chains = CHAIN_IDS
SwapPage.screen = true

export default SwapPage
