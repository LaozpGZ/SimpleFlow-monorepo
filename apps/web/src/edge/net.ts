// lib/net.ts
import { setGlobalDispatcher, Agent } from 'undici'

const agent = new Agent({
  connections: 64, // cap per-origin concurrent sockets
  keepAliveTimeout: 10_000, // reuse instead of reopening
  pipelining: 1,
})
setGlobalDispatcher(agent)
export { agent }
