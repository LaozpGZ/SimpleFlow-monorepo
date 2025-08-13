import { useV3FormState } from 'views/AddLiquidityV3/formViews/V3FormView/form/reducer'
import useV3DerivedInfo from 'hooks/v3/useV3DerivedInfo'
import { useFeeLevelQueryState } from 'state/infinity/create'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PRESET_FEE_LEVELS_V3 } from 'views/CreateLiquidityPool/constants'
import { useV3MintActionHandlers } from 'views/AddLiquidityV3/formViews/V3FormView/form/hooks/useV3MintActionHandlers'
import { tryParsePrice } from 'hooks/v3/utils'
import { V3SubmitButton } from 'views/AddLiquidityV3/components/V3SubmitButton'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import { CurrencyField as Field } from 'utils/types'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { logGTMClickAddLiquidityEvent } from 'utils/customGTMEventTracking'
import { useIsExpertMode } from '@pancakeswap/utils/user'
import { useIsTransactionUnsupported, useIsTransactionWarning } from 'hooks/Trades'
import { useV3NFTPositionManagerContract } from 'hooks/useContract'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import V3RangeSelector from 'views/AddLiquidityV3/formViews/V3FormView/components/V3RangeSelector'
import { useRangeHopCallbacks } from 'views/AddLiquidityV3/formViews/V3FormView/form/hooks/useRangeHopCallbacks'
import { Bound, ZoomLevels } from '@pancakeswap/widgets-internal'
import { AutoColumn, Box, Button, Message, MessageText, PreTitle, RowBetween, Text } from '@pancakeswap/uikit'
import { useCurrencies } from '../useCurrencies'

export const useV3CreateForm = () => {
  const { t } = useTranslation()
  const { account, chainId, isWrongNetwork } = useAccountActiveChain()
  const expertMode = useIsExpertMode()

  // Shared Create Liquidity State
  const { baseCurrency, quoteCurrency } = useCurrencies()

  const [feeLevel] = useFeeLevelQueryState()
  const feeAmount = useMemo(() => {
    if (!feeLevel || !PRESET_FEE_LEVELS_V3.includes(feeLevel)) return undefined
    return feeLevel * 1e4
  }, [feeLevel])

  // V3 Form State
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [showCapitalEfficiencyWarning, setShowCapitalEfficiencyWarning] = useState<boolean>(false)
  const [quickAction, setQuickAction] = useState<number | null>(null)

  const formState = useV3FormState()
  const { independentField, typedValue, startPriceTypedValue, leftRangeTypedValue, rightRangeTypedValue } = formState

  const {
    pool,
    ticks,
    dependentField,
    price,
    pricesAtTicks,
    parsedAmounts,
    currencyBalances,
    position,
    noLiquidity,
    currencies,
    errorMessage,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
    tickSpaceLimits,
  } = useV3DerivedInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    undefined,
    formState,
  )

  // Currency validation
  const addIsWarning = useIsTransactionWarning(currencies?.CURRENCY_A, currencies?.CURRENCY_B)
  const addIsUnsupported = useIsTransactionUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)
  const isValid = !errorMessage && !invalidRange

  // Formatted amounts for input fields
  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    }
  }, [independentField, typedValue, dependentField, parsedAmounts])

  // Get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = useMemo(
    () =>
      [Field.CURRENCY_A, Field.CURRENCY_B].reduce((accumulator, field) => {
        return {
          ...accumulator,
          [field]: maxAmountSpend(currencyBalances[field]),
        }
      }, {}),
    [currencyBalances],
  )

  // Approval States
  const nftPositionManagerAddress = useV3NFTPositionManagerContract()?.address
  const {
    approvalState: approvalA,
    approveCallback: approveACallback,
    revokeCallback: revokeACallback,
    currentAllowance: currentAllowanceA,
  } = useApproveCallback(parsedAmounts[Field.CURRENCY_A], nftPositionManagerAddress)
  const {
    approvalState: approvalB,
    approveCallback: approveBCallback,
    revokeCallback: revokeBCallback,
    currentAllowance: currentAllowanceB,
  } = useApproveCallback(parsedAmounts[Field.CURRENCY_B], nftPositionManagerAddress)

  // Existence check on parsed amounts for single-asset deposits
  const showApprovalA = useMemo(
    () => approvalA !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_A],
    [approvalA, parsedAmounts],
  )
  const showApprovalB = useMemo(
    () => approvalB !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_B],
    [approvalB, parsedAmounts],
  )

  // TICKS
  // Value and Prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  const { onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput, onStartPriceInput, onBothRangeInput } =
    useV3MintActionHandlers(noLiquidity)

  // Range Inputs
  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange } =
    useRangeHopCallbacks(baseCurrency ?? undefined, quoteCurrency ?? undefined, feeAmount, tickLower, tickUpper, pool)

  const onBothRangePriceInput = useCallback(
    (leftRangeValue: string, rightRangeValue: string) => {
      onBothRangeInput({
        leftTypedValue: tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, leftRangeValue),
        rightTypedValue: tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, rightRangeValue),
      })
    },
    [baseCurrency, quoteCurrency, onBothRangeInput],
  )

  const onLeftRangePriceInput = useCallback(
    (leftRangeValue: string) => {
      onLeftRangeInput(tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, leftRangeValue))
    },
    [baseCurrency, quoteCurrency, onLeftRangeInput],
  )

  const onRightRangePriceInput = useCallback(
    (rightRangeValue: string) => {
      onRightRangeInput(tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, rightRangeValue))
    },
    [baseCurrency, quoteCurrency, onRightRangeInput],
  )

  const handleQuickAction = useCallback(
    (value: number | null, _zoomLevel: ZoomLevels) => {
      setQuickAction(value)
      if (value !== null) {
        // Check if it's a full range action (100)
        if (value === 100) {
          setShowCapitalEfficiencyWarning(true)
          setQuickAction(100)
        } else {
          setQuickAction(value)
        }
      }
    },
    [feeAmount, setShowCapitalEfficiencyWarning],
  )

  // CREATE POOL ACTIONS
  const onAdd = useCallback(() => {
    console.log('onAdd')
  }, [])

  const onPresentCreatePoolModal = useCallback(() => {
    console.log('onPresentCreatePoolModal')
  }, [])

  // Button Submit, with handle expert mode
  const handleButtonSubmit = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    expertMode ? onAdd() : onPresentCreatePoolModal()
    logGTMClickAddLiquidityEvent()
  }, [expertMode, onAdd, onPresentCreatePoolModal])

  // Effects
  useEffect(() => {
    setShowCapitalEfficiencyWarning(false)
  }, [baseCurrency, quoteCurrency, feeAmount])

  const buttons = (
    <V3SubmitButton
      addIsUnsupported={addIsUnsupported}
      addIsWarning={addIsWarning}
      account={account ?? undefined}
      isWrongNetwork={Boolean(isWrongNetwork)}
      approvalA={approvalA}
      approvalB={approvalB}
      isValid={isValid}
      showApprovalA={showApprovalA}
      approveACallback={approveACallback}
      currentAllowanceA={currentAllowanceA}
      revokeACallback={revokeACallback}
      currencies={currencies}
      showApprovalB={showApprovalB}
      approveBCallback={approveBCallback}
      currentAllowanceB={currentAllowanceB}
      revokeBCallback={revokeBCallback}
      parsedAmounts={parsedAmounts}
      onClick={handleButtonSubmit}
      attemptingTxn={attemptingTxn}
      errorMessage={errorMessage}
      buttonText={t('Add')}
      depositADisabled={depositADisabled}
      depositBDisabled={depositBDisabled}
    />
  )

  const rangeSelector = (
    <AutoColumn gap="8px">
      <PreTitle>{t('Set Price Range')}</PreTitle>

      {!showCapitalEfficiencyWarning && (
        <V3RangeSelector
          priceLower={priceLower}
          priceUpper={priceUpper}
          getDecrementLower={getDecrementLower}
          getIncrementLower={getIncrementLower}
          getDecrementUpper={getDecrementUpper}
          getIncrementUpper={getIncrementUpper}
          onLeftRangeInput={onLeftRangeInput}
          onRightRangeInput={onRightRangeInput}
          currencyA={baseCurrency}
          currencyB={quoteCurrency}
          feeAmount={feeAmount}
          ticksAtLimit={ticksAtLimit}
          tickSpaceLimits={tickSpaceLimits}
          quickAction={quickAction}
          handleQuickAction={handleQuickAction}
        />
      )}

      {showCapitalEfficiencyWarning && (
        <Message variant="warning">
          <Box>
            <Text fontSize="16px">{t('Efficiency Comparison')}</Text>
            <Text color="textSubtle">{t('Full range positions may earn less fees than concentrated positions.')}</Text>
            <Button
              mt="16px"
              onClick={() => {
                setShowCapitalEfficiencyWarning(false)
                getSetFullRange()
              }}
              scale="md"
              variant="danger"
            >
              {t('I understand')}
            </Button>
          </Box>
        </Message>
      )}

      {outOfRange ? (
        <Message variant="warning">
          <RowBetween>
            <Text ml="12px" fontSize="12px">
              {t('Your position will not earn fees or be used in trades until the market price moves into your range.')}
            </Text>
          </RowBetween>
        </Message>
      ) : null}

      {invalidRange ? (
        <Message variant="warning">
          <MessageText>{t('Invalid range selected. The min price must be lower than the max price.')}</MessageText>
        </Message>
      ) : null}
    </AutoColumn>
  )

  return {
    // State
    formState,
    currencies,
    startPriceTypedValue,
    formattedAmounts,
    maxAmounts,
    depositADisabled,
    depositBDisabled,
    noLiquidity,

    // Components
    buttons,
    rangeSelector,

    // Actions
    onBothRangePriceInput,
    onLeftRangePriceInput,
    onRightRangePriceInput,
    onFieldAInput,
    onFieldBInput,
    onStartPriceInput,
  }
}
