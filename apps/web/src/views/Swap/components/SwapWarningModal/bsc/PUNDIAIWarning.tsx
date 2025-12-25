import { Box, Link, Text } from '@simpleflow/uikit'
import { useTranslation } from '@simpleflow/l10n'

const PUNDIAIWarning = () => {
  const { t } = useTranslation()

  return (
    <Box maxWidth="380px">
      <Text>{t('Caution - PUNDIAI Token')}</Text>
      <Text>
        {t(
          'Please exercise due caution when trading / providing liquidity for the PUNDIAI token. The protocol recently encountered a security compromise. For more information, please refer to PundiAI’s',
        )}
        <Link external ml="4px" style={{ display: 'inline' }} href="https://twitter.com/PundiAI">
          {t('Twitter')}
        </Link>
      </Text>
    </Box>
  )
}

export default PUNDIAIWarning
