import { useTranslation, Trans } from '@simpleflow/l10n'
import { Box, Text, Link } from '@simpleflow/uikit'

const ItamWarning = () => {
  const { t } = useTranslation()

  return (
    <Box maxWidth="380px">
      <Text>
        <Trans
          i18nKey="ITAM has been rebranded as ITAM CUBE. <0>Please proceed to ITAM bridge to conduct a one-way swap of your ITAM tokens.</0> All transfers of the old ITAM token will be disabled after the swap."
          components={[<Link style={{ display: 'inline' }} external href="https://itam.network/swap" />]}
        />
      </Text>
    </Box>
  )
}

export default ItamWarning
