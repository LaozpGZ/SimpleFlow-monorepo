import { PublicClient, WalletClient } from 'viem'
import { infinityStableHookABI } from './abis/infinityStableHookABI'

export class InfinityStableHook {
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
        abi: infinityStableHookABI,
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
        abi: infinityStableHookABI,
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
        abi: infinityStableHookABI,
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

  /**
   * Get the LP token balance of an account
   * @param account The account address to check
   * @returns Promise<bigint> LP token balance
   */
  async balanceOf(account: `0x${string}`): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: infinityStableHookABI,
        functionName: 'balanceOf',
        args: [account],
      })
      return result as bigint
    } catch (error) {
      console.error('Error getting balance:', error)
      throw error
    }
  }

  /**
   * Get the pool balance for a specific token
   * @param index The token index (0 or 1)
   * @returns Promise<bigint> Pool balance for the token
   */
  async balances(index: number): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: infinityStableHookABI,
        functionName: 'balances',
        args: [BigInt(index)],
      })
      return result as bigint
    } catch (error) {
      console.error('Error getting pool balance:', error)
      throw error
    }
  }

  /**
   * Remove liquidity from the stable swap pool
   * @param burnAmount Amount of LP tokens to burn
   * @param minAmount0 Minimum amount of token0 to receive
   * @param minAmount1 Minimum amount of token1 to receive
   * @returns Promise<string> Transaction hash
   */
  async removeLiquidity(burnAmount: bigint, minAmount0: bigint, minAmount1: bigint): Promise<string> {
    if (!this.walletClient || !this.walletClient.account) {
      throw new Error('Wallet client or account not available')
    }

    try {
      const hash = await this.walletClient.writeContract({
        address: this.contractAddress as `0x${string}`,
        abi: infinityStableHookABI,
        functionName: 'remove_liquidity',
        args: [burnAmount, minAmount0, minAmount1],
        account: this.walletClient.account,
        chain: this.walletClient.chain,
      })
      return hash
    } catch (error) {
      console.error('Error removing liquidity:', error)
      throw error
    }
  }
}
