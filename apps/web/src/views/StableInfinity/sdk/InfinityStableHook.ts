import { PublicClient, Address, Hex, encodeFunctionData } from 'viem'
import { infinityStableHookABI } from './abis/infinityStableHookABI'

export interface Calldata {
  address: Address
  calldata: Hex
  value?: Hex
}

export class InfinityStableHook {
  private contractAddress: string

  private publicClient: PublicClient

  constructor(contractAddress: string, publicClient: PublicClient) {
    this.contractAddress = contractAddress
    this.publicClient = publicClient
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
   * Get calldata for adding liquidity to the stable swap pool
   * @param amount0 Amount of token0 to add
   * @param amount1 Amount of token1 to add
   * @param minMintAmount Minimum amount of LP tokens to mint
   * @returns Calldata object with address and encoded function data
   */
  getAddLiquidityCalldata(amount0: bigint, amount1: bigint, minMintAmount: bigint): Calldata {
    return {
      address: this.contractAddress as `0x${string}`,
      calldata: encodeFunctionData({
        abi: infinityStableHookABI,
        functionName: 'add_liquidity',
        args: [amount0, amount1, minMintAmount],
      }),
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
   * Get calldata for removing liquidity from the stable swap pool
   * @param burnAmount Amount of LP tokens to burn
   * @param minAmount0 Minimum amount of token0 to receive
   * @param minAmount1 Minimum amount of token1 to receive
   * @param recipient Address to receive the tokens
   * @returns Calldata object with address and encoded function data
   */
  getRemoveLiquidityCalldata(
    burnAmount: bigint,
    minAmount0: bigint,
    minAmount1: bigint,
    recipient: `0x${string}`,
  ): Calldata {
    return {
      address: this.contractAddress as `0x${string}`,
      calldata: encodeFunctionData({
        abi: infinityStableHookABI,
        functionName: 'remove_liquidity',
        args: [burnAmount, minAmount0, minAmount1, recipient, false],
      }),
    }
  }

  /**
   * Calculate the amount of a single token that will be received when burning LP tokens
   * @param burnAmount Amount of LP tokens to burn
   * @param index Token index (0 or 1)
   * @returns Promise<bigint> Amount of tokens that will be received
   */
  async calcWithdrawOneCoin(burnAmount: bigint, index: number): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: infinityStableHookABI,
        functionName: 'calc_withdraw_one_coin',
        args: [burnAmount, BigInt(index)],
      })
      return result as bigint
    } catch (error) {
      console.error('Error calculating withdraw one coin:', error)
      throw error
    }
  }

  /**
   * Get calldata for removing liquidity and receiving only one token
   * @param burnAmount Amount of LP tokens to burn
   * @param zeroOrOne True for token0, false for token1
   * @param minReceived Minimum amount of tokens to receive
   * @returns Calldata object with address and encoded function data
   */
  getRemoveLiquidityOneCoinCalldata(burnAmount: bigint, zeroOrOne: boolean, minReceived: bigint): Calldata {
    return {
      address: this.contractAddress as `0x${string}`,
      calldata: encodeFunctionData({
        abi: infinityStableHookABI,
        functionName: 'remove_liquidity_one_coin',
        args: [burnAmount, zeroOrOne, minReceived],
      }),
    }
  }

  /**
   * Get calldata for removing liquidity with imbalanced token amounts
   * @param amount0 Amount of token0 to withdraw
   * @param amount1 Amount of token1 to withdraw
   * @param maxBurnAmount Maximum amount of LP tokens to burn
   * @returns Calldata object with address and encoded function data
   */
  getRemoveLiquidityImbalanceCalldata(amount0: bigint, amount1: bigint, maxBurnAmount: bigint): Calldata {
    return {
      address: this.contractAddress as `0x${string}`,
      calldata: encodeFunctionData({
        abi: infinityStableHookABI,
        functionName: 'remove_liquidity_imbalance',
        args: [amount0, amount1, maxBurnAmount],
      }),
    }
  }
}
