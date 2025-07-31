import { ConnectButton, NetworkSelector, PancakeSwapHeader } from '@pancakeswap/widgets'
import { useState } from 'react'

const langs = [
  { code: 'en', language: 'English', locale: 'en-US' },
  { code: 'fr', language: 'Français', locale: 'fr-FR' },
  { code: 'cn', language: '中文', locale: 'zh-CN' },
]
const Home = () => {
  const [chainId, setChainId] = useState(56) // Example chain ID, replace with actual logic if needed
  const [account, setAccount] = useState('') // Example account state, replace with actual logic if needed
  return (
    <>
      <PancakeSwapHeader
        navigation={<PancakeSwapHeader.Navigation />}
        bottomNavigation={<PancakeSwapHeader.BottomNavigation />}
        rightSlot={[
          <PancakeSwapHeader.CakePriceWidget cakePriceUsd={3} chainId={chainId} />,
          <PancakeSwapHeader.LocaleSelector langs={langs} />,
          <NetworkSelector chainId={chainId} chains={[56, 42_161]} switchNetwork={(i) => setChainId(i as number)} />,
          <ConnectButton
            onClickConnect={() => setAccount('0x123')}
            account={account}
            onClickAccount={() => alert('Account clicked')}
          />,
        ]}
      >
        <span>account: {account}</span>
        <div>Welcome to PancakeSwap Widgets Playground</div>
        <div>Explore our widgets and customize your experience!</div>
      </PancakeSwapHeader>
    </>
  )
}

export default Home

Home.pure = true
