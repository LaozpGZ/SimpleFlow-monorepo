// Create a provider for the SendGiftView

import { CurrencyAmount, NativeCurrency } from '@pancakeswap/sdk'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

interface SendGiftContextType {
  isSendGift: boolean
  setIsSendGift: (isSendGift: boolean) => void
  nativeAmount: CurrencyAmount<NativeCurrency> | undefined
  setNativeAmount: (amount: CurrencyAmount<NativeCurrency> | undefined) => void
  includeStarterGas: boolean
  setIncludeStarterGas: (include: boolean) => void
}

export const SendGiftContext = createContext<SendGiftContextType>({
  isSendGift: false,
  setIsSendGift: (_isSendGift: boolean) => {},
  nativeAmount: undefined,
  setNativeAmount: (_amount: CurrencyAmount<NativeCurrency> | undefined) => {},
  includeStarterGas: false,
  setIncludeStarterGas: (_include: boolean) => {},
})

export const useSendGiftContext = () => {
  const context = useContext(SendGiftContext)
  if (!context) {
    throw new Error('useSendGiftContext must be used within a SendGiftProvider')
  }
  return context
}

export const SendGiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSendGift, setIsSendGift] = useState(false)
  const [nativeAmount, setNativeAmount] = useState<CurrencyAmount<NativeCurrency> | undefined>(undefined)
  const [includeStarterGas, setIncludeStarterGas] = useState(false)

  const handleToggleIncludeStarterGas = useCallback(
    (value: boolean) => {
      setIncludeStarterGas(value)
      if (!value) {
        setNativeAmount(undefined)
      }
    },
    [includeStarterGas, setNativeAmount],
  )

  const value = useMemo(
    () => ({
      isSendGift,
      setIsSendGift,
      nativeAmount,
      setNativeAmount,
      includeStarterGas,
      setIncludeStarterGas: handleToggleIncludeStarterGas,
    }),
    [isSendGift, setIsSendGift, nativeAmount, setNativeAmount, includeStarterGas, handleToggleIncludeStarterGas],
  )

  return <SendGiftContext.Provider value={value}>{children}</SendGiftContext.Provider>
}
