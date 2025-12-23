import { languageList, useTranslation } from '@pancakeswap/localization'
import { Flex, LangSelectorV2, QuestionHelper, Text, ThemeSwitcher, Toggle } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import { useSubgraphHealthIndicatorManager } from 'state/user/hooks'
import { useUserShowTestnet } from 'state/user/hooks/useUserShowTestnet'

export const GlobalSettingsTab = () => {
  const { currentLanguage, setLanguage, t } = useTranslation()

  const { isDark, setTheme } = useTheme()

  // Global-specific state
  const [subgraphHealth, setSubgraphHealth] = useSubgraphHealthIndicatorManager()
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
          <Text>{t('Subgraph Health Indicator')}</Text>
          <QuestionHelper
            text={t(
              'Turn on subgraph health indicator all the time. Default is to show the indicator only when the network is delayed',
            )}
            placement="top"
            ml="4px"
          />
        </Flex>
        <Toggle
          id="toggle-subgraph-health-button"
          checked={subgraphHealth}
          scale="md"
          onChange={() => {
            setSubgraphHealth(!subgraphHealth)
          }}
        />
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
