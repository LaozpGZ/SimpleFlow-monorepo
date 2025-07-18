import { bsc, bscTestnet, linea } from 'viem/chains'

export const chainNameConverter = (name: string) => {
  switch (name) {
    case bsc.name:
      return 'BNB Chain'
    case linea.name:
      return 'Linea'
    case bscTestnet.name:
      return 'BNB Chain Testnet'
    default:
      return name
  }
}
