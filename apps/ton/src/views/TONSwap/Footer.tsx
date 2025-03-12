import { useTranslation } from '@pancakeswap/localization'
import { Flex, LinkExternal } from '@pancakeswap/uikit'

export const Footer = () => {
  const { t } = useTranslation()

  return (
    <Flex justifyContent="center">
      <LinkExternal href="##" color="primary60">
        {t('Bridge Assets to TON Chain')}
      </LinkExternal>
    </Flex>
  )
}
