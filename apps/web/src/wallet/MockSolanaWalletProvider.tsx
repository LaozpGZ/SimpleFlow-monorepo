import { ReactNode } from 'react'
import { WalletContext, WalletContextState } from '@solana/wallet-adapter-react'

const mockWalletContext: WalletContextState = {
  wallet: null,
  wallets: [],
  autoConnect: false,
  connected: false,
  connecting: false,
  disconnecting: false,
  publicKey: null,
  signTransaction: async (tx: any) => tx,
  signAllTransactions: async (txs: any[]) => txs,
  sendTransaction: async () => {
    throw new Error('Mock wallet: sendTransaction not available')
  },
  signMessage: async () => {
    throw new Error('Mock wallet: signMessage not available')
  },
  signIn: async () => {
    throw new Error('Mock wallet: signIn not available')
  },
  select: () => {},
  connect: async () => {
    throw new Error('Mock wallet: connect not available')
  },
  disconnect: async () => {
    throw new Error('Mock wallet: disconnect not available')
  },
}

export const MockSolanaWalletProvider = ({ children }: { children: ReactNode }) => {
  return <WalletContext.Provider value={mockWalletContext}>{children}</WalletContext.Provider>
}
