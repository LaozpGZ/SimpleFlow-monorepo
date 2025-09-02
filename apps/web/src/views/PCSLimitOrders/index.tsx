import { SwapUIV2 } from '@pancakeswap/widgets-internal'
import Page from 'components/Layout/Page'
import { SwapType } from 'views/Swap/types'
import { SwapSelection } from 'views/SwapSimplify/InfinitySwap/SwapSelectionTab'
import { ButtonAndDetailsPanel } from 'views/SwapSimplify/InfinitySwap/ButtonAndDetailsPanel'
import { LimitOrderForm } from './components/LimitOrderForm'
import { CommitButton } from './components/CommitButton'
import { MarketPricePanel } from './components/MarketPricePanel'

export const PCSLimitOrdersView = () => {
  return (
    <>
      <Page style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}>
        <SwapUIV2.SwapFormWrapper>
          <SwapUIV2.SwapTabAndInputPanelWrapper>
            <SwapSelection swapType={SwapType.LIMIT} withToolkit />
            <LimitOrderForm />
            <MarketPricePanel />
          </SwapUIV2.SwapTabAndInputPanelWrapper>

          <ButtonAndDetailsPanel pricingAndSlippage={null} swapCommitButton={<CommitButton />} tradeDetails={null} />
        </SwapUIV2.SwapFormWrapper>

        {/* TODO: add ad panel here */}
      </Page>
    </>
  )
}
