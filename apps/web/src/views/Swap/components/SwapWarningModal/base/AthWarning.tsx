import { useTranslation } from '@simpleflow/l10n'
import { Box, Text } from '@simpleflow/uikit'

export const AthWarning = () => {
  const { t } = useTranslation()

  return (
    <Box maxWidth="380px">
      <Text>{t('Warning: The $ATH token pool is not a valid token trading pair - please stop buying')}</Text>
    </Box>
  )
}
