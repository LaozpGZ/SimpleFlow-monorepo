import { useTranslation } from '@pancakeswap/localization'
import { Flex, Text } from '@pancakeswap/uikit'

export const SolanaSettingsTab = () => {
  const { t } = useTranslation()

  return (
    <Flex pb="24px" flexDirection="column" alignItems="center" justifyContent="center" minHeight="200px">
      <Text fontSize="18px" color="textSubtle">
        {t('EVM Settings')}
      </Text>
    </Flex>
  )
}
