import { TonConnectButton } from '@tonconnect/ui-react'

export const Header = () => {
  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '10px 10px',
        background: '#ddd',
        alignItems: 'center',
      }}
    >
      <span>TON Expansion</span>
      <TonConnectButton />
    </header>
  )
}
