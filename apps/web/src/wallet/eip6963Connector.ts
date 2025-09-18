import { chains } from 'utils/wagmi'
import { createConnector } from 'wagmi'
import { UserRejectedRequestError, withRetry } from 'viem'
import { EIP6963Detail } from './WalletProvider'

const cache = new Map<string, any>()

const normalizeChainId = (chainId: unknown): number => {
  if (typeof chainId === 'number') {
    return chainId
  }
  if (typeof chainId === 'string') {
    return chainId.startsWith('0x') ? parseInt(chainId, 16) : parseInt(chainId, 10)
  }
  throw new Error(`Invalid chainId: ${chainId}`)
}

// Helper function to wait for chain ID to sync with retry logic
const waitForChainIdSync = async (provider: any, expectedChainId: number, timeout = 5000) => {
  const startTime = Date.now()
  
  return withRetry(
    async () => {
      if (Date.now() - startTime > timeout) {
        throw new Error(`Chain sync timeout after ${timeout}ms`)
      }
      
      const currentChainId = normalizeChainId(await provider.request({ method: 'eth_chainId' }))
      if (currentChainId !== expectedChainId) {
        throw new Error(`ChainId mismatch. Expected: ${expectedChainId}, got: ${currentChainId}`)
      }
      return currentChainId
    },
    {
      delay: 100,
      retryCount: Math.floor(timeout / 100),
    },
  )
}

export const createEip6963Connector = (detail: EIP6963Detail) => {
  if (cache.has(detail.info.uuid)) {
    return cache.get(detail.info.uuid)
  }

  const { provider, info } = detail

  const connector = createConnector((config) => ({
    id: 'injected',
    name: info.name,
    type: 'injected',
    icon: info.icon,

    async connect({ chainId } = {}) {
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      let currentChainId = await this.getChainId()

      if (chainId && currentChainId !== chainId) {
        const chain = await this.switchChain!({ chainId }).catch((error) => {
          if (error.code === UserRejectedRequestError.code) throw error
          return { id: currentChainId }
        })
        currentChainId = chain?.id ?? currentChainId
      }

      return {
        accounts: accounts as readonly `0x${string}`[],
        chainId: currentChainId,
      }
    },

    async disconnect() {},

    async getProvider() {
      return provider
    },

    async isAuthorized() {
      if (!provider) return false
      const accounts = await provider.request({ method: 'eth_accounts' })
      return accounts.length > 0
    },

    async getAccounts() {
      if (!provider) return []
      const accounts = await provider.request({ method: 'eth_accounts' })
      return accounts as readonly `0x${string}`[]
    },

    async getChainId() {
      if (!provider) throw new Error('MetaMask not found')
      const chainId = await provider.request({ method: 'eth_chainId' })
      return normalizeChainId(chainId)
    },

    onAccountsChanged(accounts) {},

    onChainChanged() {},

    onDisconnect(callback) {
      // @ts-ignore
      const handler = (err?: unknown) => callback(err)
      provider?.on?.('disconnect', handler)
    },

    async switchChain({ chainId }) {
      try {
        // Request the chain switch from the wallet
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        })

        // Wait for the chain ID to sync with a timeout
        await waitForChainIdSync(provider, chainId)

        // Emit the change event to sync with wagmi config
        config.emitter.emit('change', { chainId })

        const chain = chains.find((x) => x.id === chainId)!
        return chain
      } catch (error) {
        // If the chain switch fails, still try to return the current chain
        const currentChainId = await this.getChainId()
        const currentChain = chains.find((x) => x.id === currentChainId)
        if (currentChain) {
          return currentChain
        }
        throw error
      }
    },
  }))
  cache.set(info.uuid, connector)
  return connector
}
