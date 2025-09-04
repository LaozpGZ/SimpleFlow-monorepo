import { useTranslation } from '@pancakeswap/localization'
import { Skeleton, Text } from '@pancakeswap/uikit'
import CurrencyInputPanelSimplify from 'components/CurrencyInputPanelSimplify'
import { FlipButton } from 'components/FlipButton'
import { useAtomValue, useSetAtom } from 'jotai'
import { Suspense } from 'react'
import { FormContainer } from 'views/SwapSimplify/InfinitySwap/FormContainer'
import { Field } from '../types/limitOrder.types'
import { baseCurrencyAtom, flipCurrenciesAtom, quoteCurrencyAtom, setCurrencyAtom } from '../state/currencyAtoms'

export const LimitOrderForm = () => {
  const { t } = useTranslation()

  const baseCurrency = useAtomValue(baseCurrencyAtom)
  const quoteCurrency = useAtomValue(quoteCurrencyAtom)

  const setCurrency = useSetAtom(setCurrencyAtom)
  const flipCurrencies = useSetAtom(flipCurrenciesAtom)

  return (
    <>
      <FormContainer>
        <Suspense fallback={<Skeleton animation="pulse" variant="round" width="100%" height="80px" />}>
          <CurrencyInputPanelSimplify
            id="limit-order-input"
            currency={baseCurrency}
            onCurrencySelect={(c) => setCurrency({ field: Field.INPUT, newCurrency: c })}
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
        <FlipButton onFlip={flipCurrencies} />
        <Suspense fallback={<Skeleton animation="pulse" variant="round" width="100%" height="80px" />}>
          <CurrencyInputPanelSimplify
            id="limit-order-output"
            currency={quoteCurrency}
            onCurrencySelect={(c) => setCurrency({ field: Field.OUTPUT, newCurrency: c })}
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
