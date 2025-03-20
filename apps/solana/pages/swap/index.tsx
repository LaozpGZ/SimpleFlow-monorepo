import '@pancakeswap/jupiter-terminal/global.css'
import '@pancakeswap/jupiter-terminal/index.css'

import { useEffect } from 'react'
import { TerminalWrapper } from 'components/SwapForm'
import { Card } from '@pancakeswap/uikit'
import { ExchangeLayout } from 'components/Layout/ExchangeLayout'
import { init } from '@pancakeswap/jupiter-terminal'

const JupiterTerminal = () => {
  useEffect(() => {
    init({
      displayMode: 'integrated',
      integratedTargetId: 'integrated-terminal',
      endpoint: 'https://api.devnet.solana.com',
      containerStyles: { maxHeight: '90vh', maxWidth: '480px', overflow: 'hidden' },
    })
  }, [])

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
