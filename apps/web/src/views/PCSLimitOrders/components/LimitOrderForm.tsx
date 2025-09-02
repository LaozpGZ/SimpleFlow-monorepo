import { useTranslation } from '@pancakeswap/localization'
import { Skeleton, Text } from '@pancakeswap/uikit'
import CurrencyInputPanelSimplify from 'components/CurrencyInputPanelSimplify'
import { FlipButton } from 'components/FlipButton'
import { Suspense } from 'react'
import { FormContainer } from 'views/SwapSimplify/InfinitySwap/FormContainer'

export const LimitOrderForm = () => {
  const { t } = useTranslation()

  return (
    <>
      <FormContainer>
        <Suspense fallback={<Skeleton animation="pulse" variant="round" width="100%" height="80px" />}>
          <CurrencyInputPanelSimplify
            id="limit-order-input"
            title={
              <Text color="textSubtle" small bold>
                {t('Sell')}
              </Text>
            }
            defaultValue=""
            onUserInput={() => {}}
            showMaxButton
          />
        </Suspense>
        <FlipButton />
        <Suspense fallback={<Skeleton animation="pulse" variant="round" width="100%" height="80px" />}>
          <CurrencyInputPanelSimplify
            id="limit-order-output"
            title={
              <Text color="textSubtle" small bold>
                {t('Buy')}
              </Text>
            }
            defaultValue=""
            onUserInput={() => {}}
            showMaxButton
          />
        </Suspense>
      </FormContainer>
    </>
  )
}
