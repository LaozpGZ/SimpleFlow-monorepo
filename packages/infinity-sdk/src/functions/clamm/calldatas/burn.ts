import { encodeFunctionData, Hex } from 'viem'
import { CLPositionManagerAbi } from '../../../abis'
import { ACTIONS } from '../../../constants/actions'
import { PoolKey } from '../../../types'
import { ActionsPlanner } from '../../../utils/ActionsPlanner'

export const encodeCLPositionManagerBurnCalldata = (
  tokenId: bigint,
  poolKey: PoolKey,
  amount0Min: bigint,
  amount1Min: bigint,
  hookData: Hex = '0x',
  deadline: bigint
) => {
  const planner = new ActionsPlanner()

  planner.add(ACTIONS.CL_BURN_POSITION, [tokenId, amount0Min, amount1Min, hookData])
  const calls = planner.finalizeModifyLiquidityWithClose(poolKey)

  return encodeFunctionData({
    abi: CLPositionManagerAbi,
    functionName: 'modifyLiquidities',
    args: [calls, deadline],
  })
}
