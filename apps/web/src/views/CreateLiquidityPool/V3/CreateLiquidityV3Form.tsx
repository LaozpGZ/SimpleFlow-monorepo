import { AutoColumn, Box, Card, CardBody, DynamicSection } from '@pancakeswap/uikit'
import { useFeeLevelQueryState } from 'state/infinity/create'
import { FieldSelectCurrencies } from '../components/FieldSelectCurrencies'
import { FieldStartingPrice } from '../components/V3/FieldStartingPrice'
import { FieldCreateDepositAmount } from '../components/V3/FieldCreateDepositAmount'
import { FieldSlippageTolerance } from '../components/FieldSlippageTolerance'
import { useV3CreateForm } from '../hooks/V3/useV3CreateForm'
import { MessagePoolInitialized } from '../components/V3/MessagePoolInitialized'
import { FieldFeeLevel } from '../components/V3/FieldFeeLevel'

export const CreateLiquidityV3Form = () => {
  const {
    // State
    currencies,
    leftRangeTypedValue,
    rightRangeTypedValue,
    startPriceTypedValue,
    formattedAmounts,
    maxAmounts,
    depositADisabled,
    depositBDisabled,
    noLiquidity,

    // Components
    buttons,
    rangeSelector,
    previewModal,

    // Actions
    onStartPriceInput,
    onFieldAInput,
    onFieldBInput,
  } = useV3CreateForm()

  const [feeLevel] = useFeeLevelQueryState()
  const poolExists = noLiquidity === false && !!feeLevel

  return (
    <Box maxWidth={[null, null, null, '520px']} mx="auto">
      <Card>
        <CardBody>
          <AutoColumn gap="24px">
            <FieldSelectCurrencies />
            <FieldFeeLevel />

            {poolExists && <MessagePoolInitialized />}

            <DynamicSection disabled={poolExists}>
              <FieldStartingPrice startPrice={startPriceTypedValue} setStartPrice={onStartPriceInput} />
            </DynamicSection>
            <DynamicSection disabled={poolExists || !startPriceTypedValue || !feeLevel}>{rangeSelector}</DynamicSection>

            <DynamicSection
              disabled={
                poolExists || !startPriceTypedValue || !feeLevel || !leftRangeTypedValue || !rightRangeTypedValue
              }
            >
              <FieldCreateDepositAmount
                currencies={currencies}
                onFieldAInput={onFieldAInput}
                onFieldBInput={onFieldBInput}
                formattedAmounts={formattedAmounts}
                maxAmounts={maxAmounts}
                depositADisabled={depositADisabled}
                depositBDisabled={depositBDisabled}
              />
            </DynamicSection>

            <DynamicSection
              disabled={
                poolExists || !startPriceTypedValue || !feeLevel || !leftRangeTypedValue || !rightRangeTypedValue
              }
            >
              <FieldSlippageTolerance />
            </DynamicSection>

            <DynamicSection
              disabled={
                poolExists || !startPriceTypedValue || !feeLevel || !leftRangeTypedValue || !rightRangeTypedValue
              }
            >
              {buttons}
            </DynamicSection>
          </AutoColumn>
        </CardBody>
      </Card>
      {previewModal}
    </Box>
  )
}
