import { SwapUIV2 } from '@pancakeswap/widgets-internal'
import Page from 'components/Layout/Page'
import { SwapType } from 'views/Swap/types'
import { SwapSelection } from 'views/SwapSimplify/InfinitySwap/SwapSelectionTab'
import { PanelWrapper } from 'views/SwapSimplify/InfinitySwap/ButtonAndDetailsPanel'
import { FormContainer } from 'views/SwapSimplify/InfinitySwap/FormContainer'
import { Link } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { Suspense } from 'react'
import { LimitOrderForm } from './components/LimitOrderForm'
import { CommitButton } from './components/CommitButton'
import { MarketPriceInput } from './components/MarketPriceInput'
import { QuickActionButtons } from './components/QuickActionButtons'
import { TradeDetails } from './components/TradeDetails'
import { TestingArea } from './components/TestingArea'
import { OrdersSummaryCard } from './components/OrderHistory/OrdersSummaryCard'

export const PCSLimitOrdersView = () => {
  const { t } = useTranslation()

  return (
    <>
      <Page style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}>
        <Suspense fallback={<h1>PAGE FALLBACK</h1>}>
          <SwapUIV2.SwapFormWrapper>
            <SwapUIV2.SwapTabAndInputPanelWrapper>
              <SwapSelection swapType={SwapType.LIMIT} withToolkit />
              <Suspense fallback={<h1>FORM FALLBACK</h1>}>
                <LimitOrderForm />
              </Suspense>

              <FormContainer>
                <Suspense fallback={<h1>SECONDARY FALLBACK</h1>}>
                  <MarketPriceInput />
                  <QuickActionButtons />
                </Suspense>
              </FormContainer>
            </SwapUIV2.SwapTabAndInputPanelWrapper>

            <PanelWrapper>
              <Suspense fallback={<h1>COMMIT BUTTON FALLBACK</h1>}>
                <CommitButton />
              </Suspense>
              <Suspense fallback={<h1>TRADE DETAILS FALLBACK</h1>}>
                <TradeDetails mt="2px" />
              </Suspense>
            </PanelWrapper>

            <Suspense fallback={<h1>ORDERS SUMMARY CARD FALLBACK</h1>}>
              <OrdersSummaryCard />
            </Suspense>
          </SwapUIV2.SwapFormWrapper>
        </Suspense>

        <Link href="/swap/limit-v1" color="primary60" textAlign="center" mx="auto">
          {t('Manage old Limit Orders (Deprecated)')} &raquo;
        </Link>

        {/* TODO: add ad panel here */}
      </Page>

      {/* TESTING */}
      <TestingArea />
    </>
  )
}
