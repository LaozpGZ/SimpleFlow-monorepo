import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'

function InfinityStableLiquidity() {
  return <div>Add Liquidity InfinityStable</div>
}

const InfinityStableLiquidityPage = dynamic(() => Promise.resolve(InfinityStableLiquidity), {
  ssr: false,
}) as NextPageWithLayout

InfinityStableLiquidityPage.chains = CHAIN_IDS

export default InfinityStableLiquidityPage
