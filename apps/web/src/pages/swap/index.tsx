import { isInBinance } from '@binance/w3w-utils'
import { CHAIN_IDS } from 'utils/wagmi'
import SwapLayout from 'views/Swap/SwapLayout'
import Swap from 'views/SwapSimplify'

const SwapPage = () => (
  <SwapLayout>
    <Swap />
  </SwapLayout>
)

SwapPage.chains = CHAIN_IDS
SwapPage.screen = true
SwapPage.w3wWagmiConfig = isInBinance()

export default SwapPage
