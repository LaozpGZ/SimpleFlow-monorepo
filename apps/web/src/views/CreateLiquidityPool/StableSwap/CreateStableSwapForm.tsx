import { AutoColumn, Card, CardBody, Grid } from '@pancakeswap/uikit'
import { StableNGFieldSelectCurrencies } from '../components/stableNG/FieldSelectCurrency'
import { ParamSettingSection } from '../components/stableNG/ParamSettingSection'

export const CreateStableSwapForm = () => {
  return (
    <Grid gridTemplateColumns={['1fr', '1fr', '1fr', 'repeat(2, 1fr)']} style={{ gap: '24px' }}>
      <Card style={{ height: 'fit-content' }}>
        <CardBody>
          <AutoColumn gap="16px">
            <StableNGFieldSelectCurrencies />
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
