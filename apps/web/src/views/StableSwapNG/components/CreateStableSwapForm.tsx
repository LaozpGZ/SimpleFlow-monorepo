import { AutoColumn, Card, CardBody, Grid } from '@pancakeswap/uikit'
import { InfinityStableFieldSelectCurrencies } from './FieldSelectCurrency'
import { ParamSettingSection } from './ParamSettingSection'

export const CreateStableSwapForm = () => {
  return (
    <Grid gridTemplateColumns={['1fr', '1fr', '1fr', 'repeat(2, 1fr)']} style={{ gap: '24px' }}>
      <Card style={{ height: 'fit-content' }}>
        <CardBody>
          <AutoColumn gap="16px">
            <InfinityStableFieldSelectCurrencies />
          </AutoColumn>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <ParamSettingSection />
        </CardBody>
      </Card>
    </Grid>
  )
}
