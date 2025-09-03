import { useTranslation } from '@pancakeswap/localization'
import { Skeleton, Text } from '@pancakeswap/uikit'
import CurrencyInputPanelSimplify from 'components/CurrencyInputPanelSimplify'
import { FlipButton } from 'components/FlipButton'
import { useAtom } from 'jotai'
import { Suspense, useCallback } from 'react'
import { FormContainer } from 'views/SwapSimplify/InfinitySwap/FormContainer'
import { useCurrency } from 'hooks/Tokens'
import { UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import currencyId from 'utils/currencyId'
import { inputCurrencyIdAtom, outputCurrencyIdAtom } from '../state/currencyAtoms'
import { Field } from '../types/limitOrder.types'

export const LimitOrderForm = () => {
  const { t } = useTranslation()

  const [currencyIdA, setIdA] = useAtom(inputCurrencyIdAtom)
  const [currencyIdB, setIdB] = useAtom(outputCurrencyIdAtom)

  const currency0 = useCurrency(currencyIdA)
  const currency1 = useCurrency(currencyIdB)

  // TODO: Validate duplicate tokens, Native-WNATIVE, etc.
  const handleCurrencySelect = useCallback((field: Field, currency: UnifiedCurrency) => {
    if (field === Field.INPUT) setIdA(currencyId(currency))
    else setIdB(currencyId(currency))
  }, [])

  return (
    <>
      <FormContainer>
        <Suspense fallback={<Skeleton animation="pulse" variant="round" width="100%" height="80px" />}>
          <CurrencyInputPanelSimplify
            id="limit-order-input"
            currency={currency0}
            onCurrencySelect={(c) => handleCurrencySelect(Field.INPUT, c)}
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
            currency={currency1}
            onCurrencySelect={(c) => handleCurrencySelect(Field.OUTPUT, c)}
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
