import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, PreTitle, QuestionHelper, Text, Toggle } from '@pancakeswap/uikit'
import { useExpertMode, useUserExpertModeAcknowledgement } from '@pancakeswap/utils/user'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import { useId, useState } from 'react'
import { TabContent } from './SettingsModalV2/TabContent'
import GasSettings from './GasSettings'
import { ExpertModeTab } from './SettingsModalV2/ExpertModeTab'

export const EVMSettingsTab = () => {
  const ariaId = useId()
  const [expertMode, setExpertMode] = useExpertMode()

  const [showExpertModalView, setShowExpertModalView] = useState(false)
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const { onChangeRecipient } = useSwapActionHandlers()
  const [showExpertModeAcknowledgement] = useUserExpertModeAcknowledgement()

  const handleExpertModeToggle = () => {
    if (expertMode || !showExpertModeAcknowledgement) {
      onChangeRecipient(null)
      setExpertMode((s) => !s)
    } else {
      setShowExpertModalView(true)
    }
  }

  if (showExpertModalView) {
    return (
      <ExpertModeTab
        key="expert_mode_tab"
        setShowConfirmExpertModal={(show) => setShowExpertModalView(show)}
        toggleExpertMode={() => setExpertMode((s) => !s)}
      />
    )
  }

  return (
    <TabContent id={`${ariaId}_motion-tabpanel-0`} role="tabpanel" aria-labelledby={`${ariaId}_motion-tab-0`}>
      <Flex flexDirection="column">
        <PreTitle>{t('Transaction Settings')}</PreTitle>

        <Box mb="24px">
          {chainId === ChainId.BSC && (
            <Flex justifyContent="space-between" alignItems="center" mb="16px">
              <GasSettings />
            </Flex>
          )}

          {/* TxDeadlintSetting hidden */}
        </Box>

        <PreTitle>{t('Interface Settings')}</PreTitle>

        <Flex justifyContent="space-between" alignItems="center" mt="8px">
          <Flex alignItems="center">
            <Text>{t('Expert Mode')}</Text>
            <QuestionHelper
              text={t('Bypasses confirmation modals and allows high slippage trades. Use at your own risk.')}
              placement="top"
              ml="4px"
            />
          </Flex>
          <Toggle id="toggle-expert-mode-button" scale="md" checked={expertMode} onChange={handleExpertModeToggle} />
        </Flex>

        {/* Flippy sounds hidden */}
      </Flex>
    </TabContent>
  )
}
