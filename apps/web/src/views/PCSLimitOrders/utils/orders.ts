import { BigintIsh } from '@pancakeswap/swap-sdk-core'
import { useCLLimitOrderHookContract } from 'hooks/useContract'
import { Address } from 'viem/accounts'
import { publicClient } from 'utils/viem'
import { ContractFunctionArgs, ContractFunctionName } from 'viem'
import { ContractOrderStatus, OrderStatus } from '../types/orders.types'

const simulateLimitOrderContract = (
  contract: ReturnType<typeof useCLLimitOrderHookContract>,
  functionName: ContractFunctionName<typeof contract.abi, 'nonpayable' | 'payable'>,
  args: ContractFunctionArgs<
    typeof contract.abi,
    'nonpayable' | 'payable',
    ContractFunctionName<typeof contract.abi, 'nonpayable' | 'payable'>
  >,
  account: Address,
) => {
  return publicClient({ chainId: contract.chain?.id }).simulateContract({
    address: contract.address,
    abi: contract.abi,
    functionName,
    args,
    account,
    chain: contract.chain,
  })
}

interface Args {
  orderId: BigintIsh
  account: Address
  contract: ReturnType<typeof useCLLimitOrderHookContract>
  isWithdrawn: boolean
}
interface OrderData {
  orderId: BigintIsh
  chainId: number
  status: ContractOrderStatus
  liquidityTotal: bigint
  tickLower: number
  zeroForOne: boolean
  accCurrency0PerLiquidity: bigint
  accCurrency1PerLiquidity: bigint
  poolId: string
  userInfo: any
  amount0Received: bigint
  amount1Received: bigint
}
export const fetchOrderDataById = async ({ contract, orderId, account, isWithdrawn }: Args) => {
  try {
    let orderData: Partial<OrderData> = {}

    console.log(`%c [Fetching Order ${orderId} Details]`, 'background: purple;color: white')
    const orderInfo = await contract.read.orderInfos([BigInt(orderId)])

    orderData = {
      orderId,
      chainId: contract.chain?.id,
      status: orderInfo[0] as ContractOrderStatus,
      liquidityTotal: orderInfo[1], // total liquidity in the order (can have multiple users)
      tickLower: orderInfo[2],
      zeroForOne: orderInfo[3],
      accCurrency0PerLiquidity: orderInfo[4],
      accCurrency1PerLiquidity: orderInfo[5],
      poolId: orderInfo[6],
    }

    // Get user info for user's liquidity
    const userInfo = await contract.read.getOrderUserInfo([BigInt(orderId), account])
    orderData.userInfo = userInfo

    // Get receiving token amounts by simulating
    if (orderData.status === ContractOrderStatus.Open) {
      const sim = await simulateLimitOrderContract(contract, 'cancelOrder', [BigInt(orderId), account], account)
      orderData.amount0Received = sim.result[0]
      orderData.amount1Received = sim.result[1]

      console.log(`%c [Simulate Cancel Order Result ${orderId}]`, 'background: lightblue;color: white', sim.result)
    } else if (isWithdrawn === false) {
      // Status is Pending or Filled and NOT withdrawn (otherwise call will fail)
      const sim = await simulateLimitOrderContract(contract, 'withdraw', [BigInt(orderId), account], account)
      orderData.amount0Received = sim.result[0]
      orderData.amount1Received = sim.result[1]

      console.log(`%c [Simulate Withdraw Result ${orderId}]`, 'background: lightblue;color: white', sim.result)
    }

    console.log(`%c [Order ${orderId} Details]`, 'background: teal;color: white', orderData)

    return orderData
  } catch (error) {
    console.error('Error fetching order data by id', orderId, error)
    return null
  }
}

// export const parseOrders = (orders: Order[]) => {
export const parseOrders = (orders: Awaited<ReturnType<typeof fetchOrderDataById>>[]) => {
  if (!orders) return []
  return orders.map((order) => {
    if (!order) return null

    const { zeroForOne } = order
    const sell = zeroForOne ? order.amount0Received : order.amount1Received
    const buy = zeroForOne ? order.amount1Received : order.amount0Received
    const limitPrice = order.tickLower
    const { status } = order
    const filled = '-'
    const amountReceived = '-'
    const actions = '-'

    return {
      ...order,
      sell,
      buy,
      limitPrice,
      status,
      filled,
      amountReceived,
      actions,
    }
  })
}
