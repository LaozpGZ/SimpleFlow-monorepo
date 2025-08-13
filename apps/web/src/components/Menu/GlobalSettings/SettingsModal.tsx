import { useTranslation } from '@pancakeswap/localization'
import { Flex, InjectedModalProps, Modal } from '@pancakeswap/uikit'
import { useCallback } from 'react'
import { styled } from 'styled-components'
import GlobalSettings from './GlobalSettings'
import SwapLiquiditySettingsContainer from './SwapLiquiditySettings'
import { SettingsMode } from './types'

const ScrollableContainer = styled(Flex)`
  flex-direction: column;
  height: auto;
  ${({ theme }) => theme.mediaQueries.xs} {
    max-height: 90vh;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    max-height: none;
  }
`

export const withCustomOnDismiss =
  (Component) =>
  ({
    onDismiss,
    customOnDismiss,
    mode,
    ...props
  }: {
    onDismiss?: () => void
    customOnDismiss: () => void
    mode: SettingsMode
  }) => {
    const handleDismiss = useCallback(() => {
      onDismiss?.()
      if (customOnDismiss) {
        customOnDismiss()
      }
    }, [customOnDismiss, onDismiss])

    return <Component {...props} mode={mode} onDismiss={handleDismiss} />
  }

const SettingsModal: React.FC<React.PropsWithChildren<InjectedModalProps>> = ({ onDismiss, mode }) => {
  const { t } = useTranslation()

  return (
    <Modal title={t('Settings')} headerBackground="gradientCardHeader" onDismiss={onDismiss}>
      <ScrollableContainer>
        {mode === SettingsMode.GLOBAL && <GlobalSettings />}
        {mode === SettingsMode.SWAP_LIQUIDITY && <SwapLiquiditySettingsContainer onDismiss={onDismiss} />}
      </ScrollableContainer>
    </Modal>
  )
}

export default SettingsModal
