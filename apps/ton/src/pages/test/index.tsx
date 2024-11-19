import { addressAtom, isConnectedAtom } from 'atoms/addressAtom'
import { useAtomValue } from 'jotai'

export default () => {
  const address = useAtomValue(addressAtom)
  const isConnected = useAtomValue(isConnectedAtom)
  return (
    <div
      style={{
        padding: '20px',
      }}
    >
      <p>Is Connected: {isConnected ? 'true' : 'false'}</p>
      <p>User Wallet Address: {address}</p>
    </div>
  )
}
