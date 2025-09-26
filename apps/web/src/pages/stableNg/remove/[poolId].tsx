import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'

function RemoveLiquidityStableNG() {
  return <div>Add Liquidity StableNG</div>
}

const RemoveLiquidityStableNGPage = dynamic(() => Promise.resolve(RemoveLiquidityStableNG), {
  ssr: false,
}) as NextPageWithLayout

RemoveLiquidityStableNGPage.chains = CHAIN_IDS

export default RemoveLiquidityStableNGPage
