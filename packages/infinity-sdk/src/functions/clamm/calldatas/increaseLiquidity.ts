import { Address, Hex } from 'viem'
import { ACTIONS } from '../../../constants/actions'
import { PoolKey } from '../../../types'
import { ActionsPlanner } from '../../../utils/ActionsPlanner'
import { encodeCLPositionModifyLiquidities } from './modifyLiquidities'

export const encodeCLPositionManagerIncreaseLiquidityCalldata = (
  tokenId: bigint,
  poolKey: PoolKey,
  liquidity: bigint,
  amount0Max: bigint,
  amount1Max: bigint,
  recipient: Address,
  hookData: Hex = '0x',
  deadline: bigint
) => {
  const planner = new ActionsPlanner()
  planner.add(ACTIONS.CL_INCREASE_LIQUIDITY, [tokenId, liquidity, amount0Max, amount1Max, hookData])

  const calls = planner.finalizeModifyLiquidityWithSettlePair(poolKey, recipient)
  return encodeCLPositionModifyLiquidities(calls, deadline)
}
