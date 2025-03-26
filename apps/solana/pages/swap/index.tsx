import '@pancakeswap/jupiter-terminal/global.css'
import '@pancakeswap/jupiter-terminal/index.css'

import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter'
import { useEffect } from 'react'
import { TerminalWrapper } from 'components/SwapForm'
import { Card, useMatchBreakpoints } from '@pancakeswap/uikit'
import { ExchangeLayout } from 'components/Layout/ExchangeLayout'
import { init, syncProps } from '@pancakeswap/jupiter-terminal'
import { logGTMSwapTxSentEvent, logGTMWalletConnectedEvent } from 'utils/curstomGTMEventTracking'
import { SOLANA_ENDPOINT } from 'config/endpoint'

const JupiterTerminal = () => {
  const { isMobile } = useMatchBreakpoints()
  const passthroughWalletContextState = useWallet()
  const { setShowModal } = useUnifiedWalletContext()

  useEffect(() => {
    if (passthroughWalletContextState.wallet?.adapter.connected) {
      logGTMWalletConnectedEvent(passthroughWalletContextState.wallet?.adapter.name)
    }
  }, [passthroughWalletContextState.wallet?.adapter.connected, passthroughWalletContextState.wallet?.adapter.name])

  useEffect(() => {
    init({
      displayMode: 'integrated',
      integratedTargetId: 'integrated-terminal',
      endpoint: SOLANA_ENDPOINT,
      refetchIntervalForTokenAccounts: 60000,
      containerStyles: {
        maxHeight: '90vh',
        maxWidth: '480px',
        overflow: 'hidden',
        width: isMobile ? 'auto' : '480px',
      },
      enableWalletPassthrough: true,
      onRequestConnectWallet: () => setShowModal(true),
      onSuccess() {
        logGTMSwapTxSentEvent()
      },
    })
  }, [isMobile, setShowModal])

  // Do not pass the passthroughWalletContextState into init.
  // Otherwise, the entire widget will refresh when the theme switches.
  useEffect(() => {
    syncProps({
      enableWalletPassthrough: true,
      passthroughWalletContextState,
    })
  }, [passthroughWalletContextState])

  return (
    <TerminalWrapper>
      <Card>
        <div id="integrated-terminal" />
      </Card>
    </TerminalWrapper>
  )
}

JupiterTerminal.Layout = ExchangeLayout

export default JupiterTerminal
