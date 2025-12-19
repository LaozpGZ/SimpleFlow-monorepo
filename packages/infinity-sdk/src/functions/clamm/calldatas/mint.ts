import { Address, encodeFunctionData, Hex, zeroAddress } from 'viem'
import { CLPositionManagerAbi } from '../../../abis'
import { ACTIONS } from '../../../constants/actions'
import { EncodedPoolKey, PoolKey } from '../../../types'
import { encodeCLPoolParameters } from '../../../utils'
import { ActionsPlanner } from '../../../utils/ActionsPlanner'

export const encodeCLPositionManagerMintCalldata = (
  poolKey: PoolKey<'CL'>,
  tickLower: number,
  tickUpper: number,
  liquidity: bigint,
  recipient: Address,
  amount0Max: bigint,
  amount1Max: bigint,
  deadline: bigint,
  hookData: Hex = '0x'
) => {
  const planner = new ActionsPlanner()
  if (!poolKey.hooks) {
    // eslint-disable-next-line no-param-reassign
    poolKey.hooks = zeroAddress as `0x${string}`
  }

  const encodedPositionConfig: EncodedPoolKey = {
    ...poolKey,
    parameters: encodeCLPoolParameters(poolKey.parameters),
  } as EncodedPoolKey

  planner.add(ACTIONS.CL_MINT_POSITION, [
    encodedPositionConfig,
    tickLower,
    tickUpper,
    liquidity,
    amount0Max,
    amount1Max,
    recipient,
    hookData,
  ])
  const calls = planner.finalizeModifyLiquidityWithSettlePair(poolKey, recipient)

  return encodeFunctionData({
    abi: CLPositionManagerAbi,
    functionName: 'modifyLiquidities',
    args: [calls, deadline],
  })
}
