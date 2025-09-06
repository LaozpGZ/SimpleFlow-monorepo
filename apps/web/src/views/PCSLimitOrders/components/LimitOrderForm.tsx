import { useTranslation } from '@pancakeswap/localization'
import { Skeleton, Text } from '@pancakeswap/uikit'
import CurrencyInputPanelSimplify from 'components/CurrencyInputPanelSimplify'
import { FlipButton } from 'components/FlipButton'
import { useAtomValue, useSetAtom } from 'jotai'
import { Suspense, useCallback, useMemo } from 'react'
import { FormContainer } from 'views/SwapSimplify/InfinitySwap/FormContainer'
import { useTokensByChainId } from 'hooks/Tokens'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { ZERO_ADDRESS } from '@pancakeswap/swap-sdk-core'
import { inputCurrencyAtom, outputCurrencyAtom } from '../state/currency/currencyAtoms'
import { formattedAmountsAtom, setInputAtom } from '../state/inputAtoms'
import { Field } from '../types/limitOrder.types'
import { tokensMapAtom } from '../state/poolsListAtom'
import { getCurrencyIdWithZeroAddr } from '../utils'
import { flipCurrenciesAtom, setCurrencyAtom } from '../state/currency/setCurrencyAtom'

export const LimitOrderForm = () => {
  const { t } = useTranslation()
  const { chainId } = useAccountActiveChain()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)

  const formattedAmounts = useAtomValue(formattedAmountsAtom)

  const supportedTokensMap = useAtomValue(tokensMapAtom)

  const setInput = useSetAtom(setInputAtom)
  const setCurrency = useSetAtom(setCurrencyAtom)
  const flipCurrencies = useSetAtom(flipCurrenciesAtom)

  const supportedTokens = useMemo(() => {
    let isNativeInputSupported = false
    let isNativeOutputSupported = false

    const inputTokenAddresses = Object.keys(supportedTokensMap) ?? []
    const outputTokenAddresses = supportedTokensMap[getCurrencyIdWithZeroAddr(inputCurrency)] ?? []

    if (inputTokenAddresses.includes(ZERO_ADDRESS)) {
      inputTokenAddresses.splice(inputTokenAddresses.indexOf(ZERO_ADDRESS))
      isNativeInputSupported = true
    }

    if (outputTokenAddresses.includes(ZERO_ADDRESS)) {
      outputTokenAddresses.splice(outputTokenAddresses.indexOf(ZERO_ADDRESS))
      isNativeOutputSupported = true
    }

    return {
      inputTokenAddresses,
      outputTokenAddresses,
      isNativeInputSupported,
      isNativeOutputSupported,
    }
  }, [supportedTokensMap, inputCurrency])

  const inputTokensMap = useTokensByChainId(supportedTokens.inputTokenAddresses, chainId)
  const outputTokensMap = useTokensByChainId(supportedTokens.outputTokenAddresses, chainId)

  const inputTokens = Object.values(inputTokensMap).filter((item) => !!item) ?? []
  const outputTokens = Object.values(outputTokensMap).filter((item) => !!item) ?? []

  console.log('TOKENS', {
    supportedTokens,
    inputTokensMap,
    outputTokensMap,
    inputTokens,
    outputTokens,
    supportedTokensMap,
  })

  const handleInput = useCallback(
    (field: Field, value: string | undefined) => {
      if (value === formattedAmounts[field]) return
      setInput({ field, value })
    },
    [formattedAmounts, setInput],
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
            showNative={supportedTokens.isNativeInputSupported}
            title={
              <Text color="textSubtle" small bold>
                {t('Sell')}
              </Text>
            }
            defaultValue={formattedAmounts[Field.CURRENCY_A]}
            onUserInput={(value) => handleInput(Field.CURRENCY_A, value)}
            onCurrencySelect={(c) => setCurrency({ field: Field.CURRENCY_A, newCurrency: c })}
            showCommonBases={false}
            supportCrossChain={false}
            showMaxButton
          />
        </Suspense>
        <FlipButton onFlip={flipCurrencies} />
        <Suspense fallback={<Skeleton animation="pulse" variant="round" width="100%" height="80px" />}>
          <CurrencyInputPanelSimplify
            id="limit-order-output"
            currency={outputCurrency}
            otherCurrency={inputCurrency}
            tokensToShow={outputTokens}
            showNative={supportedTokens.isNativeOutputSupported}
            title={
              <Text color="textSubtle" small bold>
                {t('Buy')}
              </Text>
            }
            defaultValue={formattedAmounts[Field.CURRENCY_B]}
            onUserInput={(value) => handleInput(Field.CURRENCY_B, value)}
            onCurrencySelect={(c) => setCurrency({ field: Field.CURRENCY_B, newCurrency: c })}
            showCommonBases={false}
            supportCrossChain={false}
            showMaxButton
          />
        </Suspense>
      </FormContainer>
    </>
  )
}
