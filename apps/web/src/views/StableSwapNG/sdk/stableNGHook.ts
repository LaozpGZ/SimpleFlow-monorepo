import { PublicClient, WalletClient } from 'viem'
import { stableNGHookABI } from './abis/stableNGHookABI'

export class StableNGHook {
  private contractAddress: string

  private publicClient: PublicClient

  private walletClient?: WalletClient

  constructor(contractAddress: string, publicClient: PublicClient, walletClient?: WalletClient) {
    this.contractAddress = contractAddress
    this.publicClient = publicClient
    this.walletClient = walletClient
  }

  /**
   * Calculate the amount of LP tokens to be minted for given token amounts
   * @param amounts Array of token amounts [amount0, amount1]
   * @param deposit True for adding liquidity, false for removing
   * @returns Promise<bigint> LP token amount
   */
  async calcTokenAmount(amounts: [bigint, bigint], deposit: boolean = true): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: stableNGHookABI,
        functionName: 'calc_token_amount',
        args: [amounts, deposit],
      })
      return result as bigint
    } catch (error) {
      console.error('Error calculating token amount:', error)
      throw error
    }
  }

  /**
   * Get the total supply of LP tokens
   * @returns Promise<bigint> Total supply of LP tokens
   */
  async totalSupply(): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: stableNGHookABI,
        functionName: 'totalSupply',
        args: [],
      })
      return result as bigint
    } catch (error) {
      console.error('Error getting total supply:', error)
      throw error
    }
  }

  /**
   * Add liquidity to the stable swap pool
   * @param amount0 Amount of token0 to add
   * @param amount1 Amount of token1 to add
   * @param minMintAmount Minimum amount of LP tokens to mint
   * @returns Promise<string> Transaction hash
   */
  async addLiquidity(amount0: bigint, amount1: bigint, minMintAmount: bigint): Promise<string> {
    if (!this.walletClient || !this.walletClient.account) {
      throw new Error('Wallet client or account not available')
    }

    try {
      const hash = await this.walletClient.writeContract({
        address: this.contractAddress as `0x${string}`,
        abi: stableNGHookABI,
        functionName: 'add_liquidity',
        args: [amount0, amount1, minMintAmount],
        account: this.walletClient.account,
        chain: this.walletClient.chain,
      })
      return hash
    } catch (error) {
      console.error('Error adding liquidity:', error)
      throw error
    }
  }
}
