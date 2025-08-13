import { AutoColumn, Box, Card, CardBody, DynamicSection } from '@pancakeswap/uikit'
import { useStartingPriceQueryState } from 'state/infinity/create'
import { FieldSelectCurrencies } from '../components/FieldSelectCurrencies'
import { FieldStartingPrice } from '../components/V3/FieldStartingPrice'
import { FieldCreateDepositAmount } from '../components/V3/FieldCreateDepositAmount'
import { FieldSlippageTolerance } from '../components/FieldSlippageTolerance'
import { MessagePoolInitialized } from '../components/V3/MessagePoolInitialized'
import { useV2CreateForm } from '../hooks/V2/useV2CreateForm'

export const CreateLiquidityV2Form = () => {
  const {
    // State
    currencies,
    formattedAmounts,
    maxAmounts,
    noLiquidity,

    // Components
    buttons,

    // Actions
    onFieldAInput,
    onFieldBInput,
  } = useV2CreateForm()

  const poolExists = noLiquidity === false

  const [startPriceTypedValue, setStartPriceTypedValue] = useStartingPriceQueryState()

  return (
    <Box maxWidth={[null, null, null, '520px']} mx="auto">
      <Card>
        <CardBody>
          <AutoColumn gap="24px">
            <FieldSelectCurrencies />

            {poolExists && <MessagePoolInitialized />}

            <DynamicSection disabled={poolExists}>
              <FieldStartingPrice startPrice={startPriceTypedValue ?? ''} setStartPrice={setStartPriceTypedValue} />
            </DynamicSection>

            <DynamicSection disabled={poolExists || !startPriceTypedValue}>
              <FieldCreateDepositAmount
                currencies={currencies}
                onFieldAInput={onFieldAInput}
                onFieldBInput={onFieldBInput}
                formattedAmounts={formattedAmounts}
                maxAmounts={maxAmounts}
                depositADisabled={false}
                depositBDisabled={false}
              />
            </DynamicSection>

            <DynamicSection disabled={poolExists || !startPriceTypedValue}>
              <FieldSlippageTolerance />
            </DynamicSection>

            <DynamicSection disabled={poolExists || !startPriceTypedValue}>{buttons}</DynamicSection>
          </AutoColumn>
        </CardBody>
      </Card>
    </Box>
  )
}
