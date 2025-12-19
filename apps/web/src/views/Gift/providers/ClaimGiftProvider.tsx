import { createContext, useContext, useMemo, useState } from 'react'

export const ClaimGiftContext = createContext({
  code: '',
  setCode: (_code: string) => {},
})

export const useClaimGiftContext = () => {
  const context = useContext(ClaimGiftContext)
  if (!context) {
    throw new Error('useClaimGift must be used within a ClaimGiftProvider')
  }
  return context
}

export const ClaimGiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [code, setCode] = useState('')
  const providerValue = useMemo(() => ({ code, setCode }), [code])

  return <ClaimGiftContext.Provider value={providerValue}>{children}</ClaimGiftContext.Provider>
}
