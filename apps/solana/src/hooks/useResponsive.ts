import { useBreakpointValue } from '@chakra-ui/react'
import { useState, useEffect, createContext, useContext } from 'react'

export const MatchBreakpointsContext = createContext<BreakpointChecks>({
  isMobile: false,
  isTablet: false,
  isDesktop: false
})

export type BreakpointChecks = {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

const useResponsive = (): BreakpointChecks => {
  const [isClient, setIsClient] = useState(false)
  const breakPoints = useContext(MatchBreakpointsContext)

  const isMobile = useBreakpointValue({ base: true, sm: false }) || false
  const isTablet = useBreakpointValue({ sm: true, md: false }) || false
  const isDesktop = useBreakpointValue({ md: true }) || false

  useEffect(() => {
    setIsClient(typeof window !== 'undefined')
  }, [])

  if (!isClient && breakPoints) {
    return breakPoints
  }

  return { isMobile, isTablet, isDesktop }
}

export default useResponsive
