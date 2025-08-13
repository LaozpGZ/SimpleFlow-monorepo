import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Flex, PancakeToggle, PreTitle, QuestionHelper, Text, Toggle } from '@pancakeswap/uikit'
import { useAudioPlay, useExpertMode, useUserExpertModeAcknowledgement } from '@pancakeswap/utils/user'
import { ExpertModal } from '@pancakeswap/widgets-internal'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useSpeedQuote } from 'hooks/useSpeedQuote'
import { useState } from 'react'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import GasSettings from './GasSettings'
import { RoutingSettingsButton } from './RoutingSettings'
import TransactionSettings from './TransactionSettings'

interface SwapLiquiditySettingsContainerProps {
  onDismiss?: () => void
}

// Container component that manages ExpertModal and SwapLiquiditySettings
const SwapLiquiditySettingsContainer: React.FC<SwapLiquiditySettingsContainerProps> = ({ onDismiss }) => {
  const [showConfirmExpertModal, setShowConfirmExpertModal] = useState(false)

  if (showConfirmExpertModal) {
    return <ExpertModal setShowConfirmExpertModal={setShowConfirmExpertModal} onDismiss={onDismiss} />
  }

  return <SwapLiquiditySettings onShowExpertModal={() => setShowConfirmExpertModal(true)} />
}

const SwapLiquiditySettings: React.FC<{ onShowExpertModal: () => void }> = ({ onShowExpertModal }) => {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const { onChangeRecipient } = useSwapActionHandlers()

  // Swap & Liquidity specific state
  const [showExpertModeAcknowledgement] = useUserExpertModeAcknowledgement()
  const [expertMode, setExpertMode] = useExpertMode()
  const [audioPlay, setAudioMode] = useAudioPlay()
  const [speedQuote, setSpeedQuote] = useSpeedQuote()

  const handleExpertModeToggle = () => {
    if (expertMode || !showExpertModeAcknowledgement) {
      onChangeRecipient(null)
      setExpertMode((s) => !s)
    } else {
      onShowExpertModal()
    }
  }

  return (
    <>
      <Flex pt="3px" flexDirection="column">
        <PreTitle>{t('Swaps & Liquidity')}</PreTitle>
        <Flex justifyContent="space-between" alignItems="center" mb="24px">
          {chainId === ChainId.BSC && <GasSettings />}
        </Flex>
        <TransactionSettings />
      </Flex>

      <Flex justifyContent="space-between" alignItems="center" mb="24px">
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

      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Flex alignItems="center">
          <Text>{t('Flippy sounds')}</Text>
          <QuestionHelper
            text={t('Fun sounds to make a truly immersive pancake-flipping trading experience')}
            placement="top"
            ml="4px"
          />
        </Flex>
        <PancakeToggle id="toggle-audio-play" checked={audioPlay} onChange={() => setAudioMode((s) => !s)} scale="md" />
      </Flex>

      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Flex alignItems="center">
          <Text>{t('Fast routing (BETA)')}</Text>
          <QuestionHelper text={t('Increase the speed of finding best swapping routes')} placement="top" ml="4px" />
        </Flex>
        <PancakeToggle
          id="toggle-speed-quote"
          checked={speedQuote}
          onChange={() => setSpeedQuote((s) => !s)}
          scale="md"
        />
      </Flex>

      <RoutingSettingsButton />
    </>
  )
}

export default SwapLiquiditySettingsContainer
export { SwapLiquiditySettings }
