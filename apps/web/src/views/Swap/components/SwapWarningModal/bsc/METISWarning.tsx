import { Box, Link, Text } from '@simpleflow/uikit'
import { useTranslation, Trans } from '@simpleflow/l10n'

const METISWarning = () => {
  const { t } = useTranslation()

  return (
    <Box maxWidth="380px">
      <Text>{t('Caution - METIS Token')}</Text>
      <Text>
        <Trans
          i18nKey="Please exercise due caution when trading / providing liquidity for the METIS token. The protocol was recently affected by the <0>PolyNetwork Exploit.</0> For more information, please refer to MetisDAO’s <1>Twitter</1>"
          components={[
            <Link
              external
              m="0 4px"
              style={{ display: 'inline' }}
              href="https://twitter.com/MetisDAO/status/1676431481621676032"
            />,
            <Link external ml="4px" style={{ display: 'inline' }} href="https://twitter.com/MetisDAO" />,
          ]}
        />
      </Text>
    </Box>
  )
}

export default METISWarning
