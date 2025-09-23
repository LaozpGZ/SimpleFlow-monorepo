import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, Box, Card, CardBody, Grid, Text } from '@pancakeswap/uikit'
import { FieldSelectCurrencies } from '../components/FieldSelectCurrencies'

export const CreateStableSwapForm = () => {
  const { t } = useTranslation()

  return (
    <Grid gridTemplateColumns={['1fr', '1fr', '1fr', 'repeat(2, 1fr)']} style={{ gap: '24px' }}>
      <Card style={{ height: 'fit-content' }}>
        <CardBody>
          <AutoColumn gap="16px">
            <FieldSelectCurrencies />
          </AutoColumn>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <AutoColumn gap="16px">
            <Box>
              {/* Placeholder for future StableSwap-specific fields */}
              <Box p="16px" borderRadius="12px" backgroundColor="backgroundDisabled">
                <Text color="textSubtle" fontSize="14px">
                  {t('StableSwap pool configuration coming soon...')}
                </Text>
              </Box>
            </Box>
          </AutoColumn>
        </CardBody>
      </Card>
    </Grid>
  )
}
