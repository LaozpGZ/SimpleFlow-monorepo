import { Text } from '@simpleflow/uikit'
import { useTranslation } from '@simpleflow/l10n'

const BondlyWarning = () => {
  const { t } = useTranslation()

  return <Text>{t('Warning: BONDLY has been compromised. Please remove liquidity until further notice.')}</Text>
}

export default BondlyWarning
