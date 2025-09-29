import { SwapUIV2 } from '@pancakeswap/widgets-internal'
import Page from 'components/Layout/Page'
import { SwapType } from 'views/Swap/types'
import { SwapSelection } from 'views/SwapSimplify/InfinitySwap/SwapSelectionTab'
import { PanelWrapper } from 'views/SwapSimplify/InfinitySwap/ButtonAndDetailsPanel'
import { FormContainer } from 'views/SwapSimplify/InfinitySwap/FormContainer'
import { Box, Link } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { Suspense } from 'react'
import styled from 'styled-components'
import { useAtomValue } from 'jotai'
import { LimitOrderForm } from './components/LimitOrderForm'
import { CommitButton } from './components/CommitButton'
import { MarketPriceInput } from './components/MarketPriceInput'
import { QuickActionButtons } from './components/QuickActionButtons'
import { TradeDetails } from './components/TradeDetails'
import { OrdersSummaryCard } from './components/OrderHistory/OrdersSummaryCard'
import { inputCurrencyAtom, outputCurrencyAtom } from './state/currency/currencyAtoms'

const CardFallback = styled(Box)`
  padding: 16px;
  width: 100%;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`

const LimitOrderFormWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  max-width: 480px;
  margin: 0 auto 32px;
`

export const PCSLimitOrdersView = () => {
  const { t } = useTranslation()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)

  return (
    <>
      <Page style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}>
        <LimitOrderFormWrapper>
          <SwapUIV2.SwapTabAndInputPanelWrapper>
            <SwapSelection swapType={SwapType.LIMIT} withToolkit />
            <Suspense fallback={<CardFallback height="332px" />}>
              <LimitOrderForm />
            </Suspense>

            {inputCurrency && outputCurrency && (
              <FormContainer>
                <Suspense fallback={<CardFallback height="100px" />}>
                  <MarketPriceInput />
                </Suspense>
                <Suspense fallback={<CardFallback height="46px" />}>
                  <QuickActionButtons />
                </Suspense>
              </FormContainer>
            )}
          </SwapUIV2.SwapTabAndInputPanelWrapper>

          <PanelWrapper>
            <Suspense fallback={<CardFallback height="48px" />}>
              <CommitButton />
            </Suspense>
            <Suspense fallback={<CardFallback height="50px" />}>
              <TradeDetails mt="2px" />
            </Suspense>
          </PanelWrapper>

          <Suspense>
            <OrdersSummaryCard />
          </Suspense>
        </LimitOrderFormWrapper>

        <Link href="/swap/limit-v1" color="primary60" textAlign="center" mx="auto">
          {t('Manage old Limit Orders (Deprecated)')} &raquo;
        </Link>

        {/* TODO: add ad panel here */}
      </Page>
    </>
  )
}
