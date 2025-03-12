import { Token } from '@pancakeswap/sdk'

export const useToken = (address: string): Token | undefined => {
  return new Token(1, address as `0x${string}`, 18, 'TON', 'TON') // dummy value
}
