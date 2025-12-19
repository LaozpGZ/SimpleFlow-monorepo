import { ReactNode, createContext, useContext, useMemo } from 'react'

const Context = createContext({
  isInfinity: false,
})

export const useInfinityContext = () => {
  const context = useContext(Context)
  return context
}

export const InfinityProvider = ({ children }: { children: ReactNode }) => {
  const providerValue = useMemo(() => ({ isInfinity: true }), [])
  return <Context.Provider value={providerValue}>{children}</Context.Provider>
}
