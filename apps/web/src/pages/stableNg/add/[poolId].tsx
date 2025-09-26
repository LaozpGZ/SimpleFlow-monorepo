import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'

function AddLiquidityStableNG() {
  return <div>Add Liquidity StableNG</div>
}

const AddLiquidityStableNGPage = dynamic(() => Promise.resolve(AddLiquidityStableNG), {
  ssr: false,
}) as NextPageWithLayout

AddLiquidityStableNGPage.chains = CHAIN_IDS

export default AddLiquidityStableNGPage
