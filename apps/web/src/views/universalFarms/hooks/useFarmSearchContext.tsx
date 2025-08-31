import { createContext, useContext, useMemo } from 'react'

const FarmSearchContext = createContext({
  enabled: false,
})

export const useIsFarmSearchContext = () => {
  const context = useContext(FarmSearchContext)
  if (!context) {
    throw new Error('useFarmSearchContext must be used within a FarmSearchProvider')
  }
  return context.enabled
}

export const FarmSearchContextProvider = ({ children }: { children: React.ReactNode }) => {
  const providerValue = useMemo(() => ({ enabled: true }), [])
  return <FarmSearchContext.Provider value={providerValue}>{children}</FarmSearchContext.Provider>
}
