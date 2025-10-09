import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'

function RemoveLiquidityInfinityStable() {
  return <div>Add Liquidity InfinityStable</div>
}

const RemoveLiquidityInfinityStablePage = dynamic(() => Promise.resolve(RemoveLiquidityInfinityStable), {
  ssr: false,
}) as NextPageWithLayout

RemoveLiquidityInfinityStablePage.chains = CHAIN_IDS

export default RemoveLiquidityInfinityStablePage
