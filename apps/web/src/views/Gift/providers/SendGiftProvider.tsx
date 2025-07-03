// Create a provider for the SendGiftView

import { createContext, useState } from 'react'

export const SendGiftContext = createContext({
  isSendGift: false,
  setIsSendGift: (_isSendGift: boolean) => {},
})

export const SendGiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSendGift, setIsSendGift] = useState(false)

  return <SendGiftContext.Provider value={{ isSendGift, setIsSendGift }}>{children}</SendGiftContext.Provider>
}
