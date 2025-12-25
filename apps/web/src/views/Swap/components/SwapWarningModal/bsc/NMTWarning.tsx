import { useTranslation } from '@simpleflow/l10n'
import { Box, Text } from '@simpleflow/uikit'

const NFPWarning = () => {
  const { t } = useTranslation()

  return (
    <Box maxWidth="380px">
      <Text>
        {t(`NMT Token has recently experienced an exploit. Please refrain from swapping NMT until further notice.`)}
      </Text>
    </Box>
  )
}

export default NFPWarning
