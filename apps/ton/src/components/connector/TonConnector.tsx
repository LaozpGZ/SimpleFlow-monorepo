import { TonConnectUIProvider, useTonAddress } from '@tonconnect/ui-react'
import { addressAtom } from 'atoms/addressAtom'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

export const TonConnector = ({ children }: { children: React.ReactNode }) => {
  return (
    <TonConnectUIProvider manifestUrl="/ton-manifest.json">
      <Container>{children}</Container>
    </TonConnectUIProvider>
  )
}

const Container = ({ children }: { children: React.ReactNode }) => {
  const address = useTonAddress()
  const setAddress = useSetAtom(addressAtom)
  useEffect(() => {
    setAddress(address)
  }, [address])

  return children
}
