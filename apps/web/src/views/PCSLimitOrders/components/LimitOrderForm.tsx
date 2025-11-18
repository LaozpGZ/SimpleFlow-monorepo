import { useTranslation } from '@pancakeswap/localization'
import { ErrorIcon, Message, Skeleton, Text } from '@pancakeswap/uikit'
import CurrencyInputPanelSimplify from 'components/CurrencyInputPanelSimplify'
import { FlipButton } from 'components/FlipButton'
import { useAtomValue, useSetAtom } from 'jotai'
import { Suspense, useCallback } from 'react'
import { FormContainer } from 'views/SwapSimplify/InfinitySwap/FormContainer'
import { formattedAmountsAtom, setInputAtom } from 'views/PCSLimitOrders/state/form/inputAtoms'
import { Currency, UnifiedCurrency } from '@pancakeswap/sdk'
import { inputCurrencyAtom, outputCurrencyAtom } from '../state/currency/currencyAtoms'
import { Field } from '../types/limitOrder.types'
import { flipCurrenciesAtom, setCurrencyAtom } from '../state/currency/setCurrencyAtoms'
import { useSupportedTokens } from '../hooks/useSupportedTokens'
import { useLimitOrderUserBalance } from '../hooks/useLimitOrderUserBalance'

export const LimitOrderForm = () => {
  const { t } = useTranslation()
  const { inputTokens, outputTokens, isNativeInputSupported, isNativeOutputSupported } = useSupportedTokens()

  const { maxInputBalance, maxOutputBalance, getPercentInputCurrency, getPercentOutputCurrency } =
    useLimitOrderUserBalance()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)
  const formattedAmounts = useAtomValue(formattedAmountsAtom)

  const setInput = useSetAtom(setInputAtom)
  const setCurrency = useSetAtom(setCurrencyAtom)
  const flipCurrencies = useSetAtom(flipCurrenciesAtom)

  const { showMinimumUSDWarning, showMinimumBNBWarning } = useLimitOrderUserBalance()

  const handleInputUserInput = useCallback(
    (value: string | undefined) => {
      if (value === formattedAmounts[Field.CURRENCY_A]) return
      setInput({ field: Field.CURRENCY_A, value })
    },
    [formattedAmounts, setInput],
  )

  const handleInputCurrencySelect = useCallback(
    (currency: UnifiedCurrency) => setCurrency({ field: Field.CURRENCY_A, newCurrency: currency as Currency }),
    [setCurrency],
  )

  const handleInputPercentInput = useCallback(
    (percent: number) => handleInputUserInput(getPercentInputCurrency(percent)),
    [handleInputUserInput],
  )

  const handleInputMax = useCallback(
    () => handleInputUserInput(maxInputBalance),
    [handleInputUserInput, maxInputBalance],
  )

  const handleOutputUserInput = useCallback(
    (value: string | undefined) => {
      if (value === formattedAmounts[Field.CURRENCY_B]) return
      setInput({ field: Field.CURRENCY_B, value })
    },
    [formattedAmounts, setInput],
  )

  const handleOutputCurrencySelect = useCallback(
    (currency: UnifiedCurrency) => setCurrency({ field: Field.CURRENCY_B, newCurrency: currency as Currency }),
    [setCurrency],
  )

  const handleOutputPercentInput = useCallback(
    (percent: number) => handleOutputUserInput(getPercentOutputCurrency(percent)),
    [handleOutputUserInput],
  )

  const handleOutputMax = useCallback(
    () => handleOutputUserInput(maxOutputBalance),
    [handleOutputUserInput, maxOutputBalance],
  )

  return (
    <>
      <FormContainer>
        <Suspense fallback={<Skeleton animation="pulse" variant="round" width="100%" height="80px" />}>
          <CurrencyInputPanelSimplify
            id="limit-order-input"
            currency={inputCurrency}
            otherCurrency={outputCurrency}
            tokensToShow={inputTokens}
            showNative={isNativeInputSupported}
            title={
              <Text color="textSubtle" small bold>
                {t('Sell')}
              </Text>
            }
            defaultValue={formattedAmounts[Field.CURRENCY_A]}
            onUserInput={handleInputUserInput}
            onCurrencySelect={handleInputCurrencySelect}
            showCommonBases={false}
            supportCrossChain={false}
            showUSDPrice
            showMaxButton
            onPercentInput={handleInputPercentInput}
            onMax={handleInputMax}
          />
        </Suspense>
        {showMinimumUSDWarning && (
          <Message
            variant="danger"
            padding="12px"
            style={{ borderRadius: '20px' }}
            icon={<ErrorIcon color="destructive" width="24px" height="24px" />}
          >
            <Text lineHeight="1.8" small>
              {showMinimumBNBWarning
                ? t('Order Size must meet a minimum of 0.05 BNB')
                : t('Order Size must meet a minimum of 50 USD')}
            </Text>
          </Message>
        )}
        <Suspense fallback={<Skeleton animation="pulse" variant="round" width="100%" height="40px" />}>
          <FlipButton onFlip={flipCurrencies} />
        </Suspense>
        <Suspense fallback={<Skeleton animation="pulse" variant="round" width="100%" height="80px" />}>
          <CurrencyInputPanelSimplify
            id="limit-order-output"
            currency={outputCurrency}
            otherCurrency={inputCurrency}
            tokensToShow={outputTokens}
            showNative={isNativeOutputSupported}
            title={
              <Text color="textSubtle" small bold>
                {t('Buy')}
              </Text>
            }
            defaultValue={formattedAmounts[Field.CURRENCY_B]}
            onUserInput={handleOutputUserInput}
            onCurrencySelect={handleOutputCurrencySelect}
            showCommonBases={false}
            supportCrossChain={false}
            showUSDPrice
            showMaxButton
            onPercentInput={handleOutputPercentInput}
            onMax={handleOutputMax}
          />
        </Suspense>
      </FormContainer>
    </>
  )
}
