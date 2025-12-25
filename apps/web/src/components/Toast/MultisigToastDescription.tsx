import { Text } from '@simpleflow/uikit'
import { useTranslation } from '@simpleflow/l10n'

const MultisigToastDescription: React.FC = () => {
  const { t } = useTranslation()

  return <Text>{t('Transaction pending approvals. Execution will occur after multisig confirmation.')}</Text>
}

export default MultisigToastDescription
