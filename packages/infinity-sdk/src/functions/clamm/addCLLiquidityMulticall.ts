import { Address, Hex } from 'viem'
import { Permit2Signature, PoolKey } from '../../types'
import { encodeMulticall } from '../../utils/encodeMulticall'
import { encodePermit2 } from '../../utils/encodePermit2'
import {
  encodeCLPositionManagerIncreaseLiquidityCalldata,
  encodeCLPositionManagerInitializePoolCalldata,
  encodeCLPositionManagerMintCalldata,
} from './calldatas'

export const addCLLiquidityMulticall = ({
  isInitialized,
  sqrtPriceX96,
  tokenId,
  poolKey,
  tickLower,
  tickUpper,
  liquidity,
  owner,
  recipient,
  amount0Max,
  amount1Max,
  deadline,
  modifyPositionHookData,
  token0Permit2Signature,
  token1Permit2Signature,
}: {
  isInitialized: boolean
  sqrtPriceX96: bigint
  tokenId?: bigint
  poolKey: PoolKey
  tickLower: number
  tickUpper: number
  liquidity: bigint
  owner: Address
  recipient: Address
  amount0Max: bigint
  amount1Max: bigint
  deadline: bigint
  modifyPositionHookData: Hex
  token0Permit2Signature?: Permit2Signature
  token1Permit2Signature?: Permit2Signature
}) => {
  const calls: Hex[] = []

  if (!isInitialized) {
    calls.push(encodeCLPositionManagerInitializePoolCalldata(poolKey, sqrtPriceX96))
  }
  if (token0Permit2Signature) {
    calls.push(encodePermit2(owner, token0Permit2Signature))
  }

  if (token1Permit2Signature) {
    calls.push(encodePermit2(owner, token1Permit2Signature))
  }

  // mint
  if (typeof tokenId === 'undefined') {
    calls.push(
      encodeCLPositionManagerMintCalldata(
        poolKey,
        tickLower,
        tickUpper,
        liquidity,
        recipient,
        amount0Max,
        amount1Max,
        deadline,
        modifyPositionHookData
      )
    )
  } else {
    // increase liquidity
    calls.push(
      encodeCLPositionManagerIncreaseLiquidityCalldata(
        tokenId,
        poolKey,
        liquidity,
        amount0Max,
        amount1Max,
        recipient,
        modifyPositionHookData,
        deadline
      )
    )
  }

  return encodeMulticall(calls)
}
