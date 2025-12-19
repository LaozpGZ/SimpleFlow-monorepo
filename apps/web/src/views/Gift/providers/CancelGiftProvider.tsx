import { createContext, useMemo, useState } from 'react'

export const CancelGiftContext = createContext({
  codeHash: '',
  setCodeHash: (_codeHash: string) => {},
})

export const CancelGiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [codeHash, setCodeHash] = useState('')
  const providerValue = useMemo(() => ({ codeHash, setCodeHash }), [codeHash])
  return <CancelGiftContext.Provider value={providerValue}>{children}</CancelGiftContext.Provider>
}
