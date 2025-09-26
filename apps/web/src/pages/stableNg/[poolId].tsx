import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'

function StableNGLiquidity() {
  return <div>Add Liquidity StableNG</div>
}

const StableNGLiquidityPage = dynamic(() => Promise.resolve(StableNGLiquidity), {
  ssr: false,
}) as NextPageWithLayout

StableNGLiquidityPage.chains = CHAIN_IDS

export default StableNGLiquidityPage
