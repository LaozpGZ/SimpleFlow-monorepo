import { AutoColumn, Box, Card, CardBody } from '@pancakeswap/uikit'
import { FieldSelectCurrencies } from '../components/FieldSelectCurrencies'
import { FieldFeeLevel } from '../components/FieldFeeLevel'
import { FieldStartingPrice } from '../components/FieldStartingPrice'
import { FieldPriceRange } from '../components/FieldPriceRange'
import { FieldCreateDepositAmount } from '../components/FieldCreateDepositAmount'
import { FieldSlippageTolerance } from '../components/FieldSlippageTolerance'
import { SubmitCreateButton } from '../components/SubmitCreateButton'

export const CreateLiquidityV3Form = () => {
  return (
    <Box maxWidth={[null, null, null, '520px']} mx="auto">
      <Card>
        <CardBody>
          <AutoColumn gap="24px">
            <FieldSelectCurrencies />
            <FieldFeeLevel />
            <FieldStartingPrice />
            <FieldPriceRange />
            <FieldCreateDepositAmount />
            <FieldSlippageTolerance />
            <SubmitCreateButton />
          </AutoColumn>
        </CardBody>
      </Card>
    </Box>
  )
}
