import { languageList, useTranslation } from '@pancakeswap/localization'
import { Flex, LangSelectorV2, Text, ThemeSwitcher, Toggle } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import { useUserShowTestnet } from 'state/user/hooks/useUserShowTestnet'

export const GlobalSettingsTab = () => {
  const { currentLanguage, setLanguage, t } = useTranslation()

  const { isDark, setTheme } = useTheme()
  const [showTestnet, setShowTestnet] = useUserShowTestnet()

  return (
    <Flex pb="24px" flexDirection="column">
      <Flex justifyContent="space-between" mb="24px" alignItems="center">
        <Text>{t('Language')}</Text>
        <LangSelectorV2 currentLang={currentLanguage.code} langs={languageList} setLang={setLanguage} />
      </Flex>

      <Flex justifyContent="space-between" mb="24px">
        <Text>{t('Dark mode')}</Text>
        <ThemeSwitcher isDark={isDark} toggleTheme={() => setTheme(isDark ? 'light' : 'dark')} />
      </Flex>

      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Flex alignItems="center">
          <Text>{t('Show testnet')}</Text>
        </Flex>
        <Toggle
          id="toggle-show-testnet"
          checked={showTestnet}
          scale="md"
          onChange={() => {
            setShowTestnet((s) => !s)
          }}
        />
      </Flex>
    </Flex>
  )
}
