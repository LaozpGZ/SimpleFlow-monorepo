import { createContext, useState } from 'react'

export const ClaimGiftContext = createContext({
  code: '',
  setCode: (_code: string) => {},
})

export const ClaimGiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [code, setCode] = useState('')
  return <ClaimGiftContext.Provider value={{ code, setCode }}>{children}</ClaimGiftContext.Provider>
}
