import { SwapUIV2 } from '@pancakeswap/widgets-internal'
import Page from 'components/Layout/Page'
import { SwapType } from 'views/Swap/types'
import { SwapSelection } from 'views/SwapSimplify/InfinitySwap/SwapSelectionTab'
import { PanelWrapper } from 'views/SwapSimplify/InfinitySwap/ButtonAndDetailsPanel'
import { FormContainer } from 'views/SwapSimplify/InfinitySwap/FormContainer'
import { Box, Link, Skeleton } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { Suspense } from 'react'
import styled from 'styled-components'
import { LimitOrderForm } from './components/LimitOrderForm'
import { CommitButton } from './components/CommitButton'
import { MarketPriceInput } from './components/MarketPriceInput'
import { QuickActionButtons } from './components/QuickActionButtons'
import { TradeDetails } from './components/TradeDetails'
import { OrdersSummaryCard } from './components/OrderHistory/OrdersSummaryCard'

const CardFallback = styled(Box)`
  padding: 16px;
  width: 100%;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`

export const PCSLimitOrdersView = () => {
  const { t } = useTranslation()

  return (
    <>
      <Page style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}>
        <SwapUIV2.SwapFormWrapper>
          <SwapUIV2.SwapTabAndInputPanelWrapper>
            <SwapSelection swapType={SwapType.LIMIT} withToolkit />
            <Suspense fallback={<CardFallback height="332px" />}>
              <LimitOrderForm />
            </Suspense>

            <FormContainer>
              <Suspense fallback={<CardFallback height="100px" />}>
                <MarketPriceInput />
              </Suspense>
              <Suspense fallback={<CardFallback height="46px" />}>
                <QuickActionButtons />
              </Suspense>
            </FormContainer>
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
        </SwapUIV2.SwapFormWrapper>

        <Link href="/swap/limit-v1" color="primary60" textAlign="center" mx="auto">
          {t('Manage old Limit Orders (Deprecated)')} &raquo;
        </Link>

        {/* TODO: add ad panel here */}
      </Page>
    </>
  )
}
