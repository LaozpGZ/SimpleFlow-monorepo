import '@pancakeswap/jupiter-terminal/global.css'
import '@pancakeswap/jupiter-terminal/index.css'

import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter'

import { useEffect } from 'react'
import { type Wallet } from '@solana/wallet-adapter-react'
import { TerminalWrapper } from 'components/SwapForm'
import { Card, useMatchBreakpoints } from '@pancakeswap/uikit'
import { ExchangeLayout } from 'components/Layout/ExchangeLayout'
import { init } from '@pancakeswap/jupiter-terminal'
import { logGTMSwapTxSentEvent, logGTMWalletConnectedEvent } from 'utils/curstomGTMEventTracking'

const JupiterTerminal = () => {
  const { isMobile, isTablet } = useMatchBreakpoints()
  const passthroughWalletContextState = useWallet()
  const { setShowModal } = useUnifiedWalletContext()

  useEffect(() => {
    init({
      displayMode: 'integrated',
      integratedTargetId: 'integrated-terminal',
      endpoint: process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT ?? 'https://api.devnet.solana.com',
      containerStyles: {
        maxHeight: '90vh',
        maxWidth: '480px',
        overflow: 'hidden',
        width: isMobile || isTablet ? 'auto' : '480px',
      },
      enableWalletPassthrough: true,
      passthroughWalletContextState,
      onRequestConnectWallet: () => setShowModal(true),

      onSuccess() {
        logGTMSwapTxSentEvent()
      },
      onWalletConnected(wallet: Wallet | null) {
        if (wallet) {
          logGTMWalletConnectedEvent(wallet.adapter.name)
        }
      },
    })
  }, [isMobile, isTablet, passthroughWalletContextState, setShowModal])

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
