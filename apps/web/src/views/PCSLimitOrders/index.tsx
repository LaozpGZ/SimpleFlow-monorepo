import { SwapUIV2 } from '@pancakeswap/widgets-internal'
import Page from 'components/Layout/Page'
import { SwapType } from 'views/Swap/types'
import { SwapSelection } from 'views/SwapSimplify/InfinitySwap/SwapSelectionTab'
import { PanelWrapper } from 'views/SwapSimplify/InfinitySwap/ButtonAndDetailsPanel'
import { FormContainer } from 'views/SwapSimplify/InfinitySwap/FormContainer'
import { Link } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { LimitOrderForm } from './components/LimitOrderForm'
import { CommitButton } from './components/CommitButton'
import { MarketPriceInput } from './components/MarketPriceInput'
import { QuickActionButtons } from './components/QuickActionButtons'
import { TradeDetails } from './components/TradeDetails'

export const PCSLimitOrdersView = () => {
  const { t } = useTranslation()

  return (
    <>
      <Page style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}>
        <SwapUIV2.SwapFormWrapper>
          <SwapUIV2.SwapTabAndInputPanelWrapper>
            <SwapSelection swapType={SwapType.LIMIT} withToolkit />
            <LimitOrderForm />

            <FormContainer>
              <MarketPriceInput />
              <QuickActionButtons />
            </FormContainer>
          </SwapUIV2.SwapTabAndInputPanelWrapper>

          <PanelWrapper>
            <CommitButton />
            <TradeDetails mt="2px" />
          </PanelWrapper>
        </SwapUIV2.SwapFormWrapper>

        <Link href="/swap/limit-v1" color="primary60" textAlign="center" mx="auto">
          {t('Manage old Limit Orders (Deprecated)')} &raquo;
        </Link>

        {/* TODO: add ad panel here */}
      </Page>
    </>
  )
}
