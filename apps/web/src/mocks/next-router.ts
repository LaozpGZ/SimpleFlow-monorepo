// Mock Next.js router for Vite
// Create stable references to prevent infinite re-renders
const stableQuery = {}
const stableEvents = {
  on: (_event: string, _handler: (...args: any[]) => void) => {
    // Mock implementation - no-op
  },
  off: (_event: string, _handler: (...args: any[]) => void) => {
    // Mock implementation - no-op
  },
  emit: (_event: string, ..._args: any[]) => {
    // Mock implementation - no-op
  },
}

export const useRouter = () => ({
  push: (url: string) => {
    window.location.href = url
  },
  replace: (url: string) => {
    window.location.replace(url)
  },
  back: () => {
    window.history.back()
  },
  forward: () => {
    window.history.forward()
  },
  refresh: () => {
    window.location.reload()
  },
  prefetch: () => {
    // Mock implementation - no-op
  },
  beforePopState: (_cb: () => boolean) => {
    // Mock implementation - just return cleanup function
    return () => {}
  },
  pathname: window.location.pathname,
  query: stableQuery,
  asPath: window.location.pathname,
  route: window.location.pathname,
  isReady: true,
  events: stableEvents,
})

export default {
  useRouter,
}
