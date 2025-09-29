// Polyfills for Node.js modules in browser environment
import { Buffer } from 'buffer'

// Make Buffer available globally
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}

// Export for explicit imports
export { Buffer }
