import { OrderType } from '@pancakeswap/price-api-sdk'
import { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import { BRIDGE_API_ENDPOINT } from 'config/constants/endpoints'
import { Address } from 'viem/accounts'
import { BridgeOrderWithCommands } from '../utils'

export type GetBridgeCalldataResponse = {
  transactionData: {
    router: Address
    calldata: `0x${string}`
  }
  gasFee: string
}

enum Command {
  BRIDGE = 'BRIDGE',
  SWAP = 'SWAP',
}

interface BridgeDataSchema {
  command: Command.BRIDGE
  data: {
    inputToken: Address
    outputToken: Address
    inputAmount: string
    minOutputAmount?: string
    originChainId: number
    destinationChainId: number
    originChainRecipient: Address
    // destinationChainRecipient?: Address
  }
}

// // Define the schema for the "SWAP" command data
// export const SwapDataSchema = Type.Object({
//   originChainId: Type.Number(),
//   trade: TradeSchema,
//   slippageTolerance: Type.Number(),
//   deadlineOrPreviousBlockhash: Type.Optional(Type.String()),
//   recipient: Type.Optional(addressModel),
// });

interface SwapDataSchema {
  command: Command.SWAP
  data: {
    originChainId: number
    trade: any
    slippageTolerance: number
    deadlineOrPreviousBlockhash?: string
    recipient?: Address
  }
}

interface CalldataRequestSchema {
  inputToken: Address
  outputToken: Address
  inputAmount: string
  originChainId: number
  destinationChainId: number
  recipientOnDestChain: Address
  commands: (BridgeDataSchema | SwapDataSchema)[]
}

export function getTokenAddress(currency: Currency): Address {
  return currency.isNative ? '0x0000000000000000000000000000000000000000' : currency.wrapped.address
}

export const getBridgeCalldata = async ({
  order,
  recipient,
}: {
  order: BridgeOrderWithCommands
  recipient: Address
}) => {
  try {
    if (!Array.isArray(order?.commands)) {
      throw new Error('No bridge commands found')
    }

    const commands: (BridgeDataSchema | SwapDataSchema)[] = order.commands.map((command) => {
      if (command.type === OrderType.PCS_BRIDGE) {
        return {
          command: Command.BRIDGE,
          data: {
            inputToken: getTokenAddress(command.trade.inputAmount.currency),
            outputToken: getTokenAddress(command.trade.outputAmount.currency),

            inputAmount: command.trade.inputAmount.quotient.toString(),
            originChainId: command.trade.inputAmount.currency.chainId,
            destinationChainId: command.trade.outputAmount.currency.chainId,
            originChainRecipient: recipient,
            // TODO: enable this after endpoint is updated
            // minOutputAmount: command.trade.outputAmount.quotient.toString(),
            minOutputAmount: '1',
          },
        }
      }

      const replacer = (_, value: any) => {
        return typeof value === 'bigint' ? value.toString() : value
      }

      return {
        command: Command.SWAP,
        data: {
          originChainId: command.trade.inputAmount.currency.chainId,
          trade: JSON.parse(JSON.stringify(command.trade, replacer, 2)),
          slippageTolerance: 50,
        },
      }
    })

    const calldataRequest: CalldataRequestSchema = {
      inputToken: getTokenAddress(order.trade.inputAmount.currency),
      outputToken: getTokenAddress(order.trade.outputAmount.currency),
      inputAmount: order.trade.inputAmount.quotient.toString(),
      originChainId: order.trade.inputAmount.currency.chainId,
      destinationChainId: order.trade.outputAmount.currency.chainId,
      recipientOnDestChain: recipient,
      commands,
    }

    const resp = await fetch(`${BRIDGE_API_ENDPOINT}/v1/calldata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calldataRequest),
    })

    const data = (await resp.json()) as GetBridgeCalldataResponse
    return data
  } catch (error) {
    console.error('getBridgeCalldata Error', error)
    throw error
  }
}

export type PostBridgeCheckApprovalResponse = {
  approval?: {
    isRequired: boolean
    to?: `0x${string}`
    value?: `0x${string}`
    from?: `0x${string}`
    data?: `0x${string}`
  }
  error?: {
    code: string
    message: string
  }
}

export const postBridgeCheckApproval = async ({
  currencyAmountIn,
  recipient,
}: {
  currencyAmountIn: CurrencyAmount<Currency>
  recipient: Address
}) => {
  try {
    const resp = await fetch(`${BRIDGE_API_ENDPOINT}/v1/check-approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: recipient,
        token: getTokenAddress(currencyAmountIn.currency),
        amount: currencyAmountIn.quotient.toString(),
        chainId: currencyAmountIn.currency.chainId,
      }),
    })

    const data = (await resp.json()) as PostBridgeCheckApprovalResponse
    return data
  } catch (error) {
    console.error('postBridgeCheckApproval Error', error)
    throw error
  }
}

export interface Route {
  originChainId: number
  destinationChainId: number
  originToken: string
  destinationToken: string
  destinationTokenSymbol: string
}

export type GetAvailableRoutesParams = {
  originChainId?: number
  destinationChainId?: number
  originToken?: string
  destinationToken?: string
}

export const getBridgeAvailableRoutes = async (params: GetAvailableRoutesParams) => {
  const stringParams = Object.fromEntries(
    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, value?.toString()]),
  )
  const resp = await fetch(`${BRIDGE_API_ENDPOINT}/v1/routes?${new URLSearchParams(stringParams).toString()}`)
  const data = (await resp.json()) as Route[]
  return data
}

export type Metadata = {
  // Define the metadata structure based on backend response
  routes?: Route[]
  quote?: {
    outputAmount: string
    minOutputAmount: string
    gasFee?: string
  }
  // Add additional fields as needed
}

export type GetMetadataParams = {
  inputToken: Address
  originChainId: number | string
  outputToken: Address
  destinationChainId: number | string
  amount: string
}

export interface MetadataResponse {
  supported: boolean
  reason?: string
}

export interface MetadataSuccessResponse extends MetadataResponse {
  amount: string
  inputToken: string
  originChainId: number
  outputToken: string
  destinationChainId: number
  bridgeFee: string
  bridgeFeeUSD: string
  fillDeadline: number
  expectedFillTimeSec: string
  isAmountTooLow: boolean
  minOutputAmount: string
  limits: {
    minDeposit: string
    maxDeposit: string
    maxDepositInstant: string
    maxDepositShortDelay: string
    recommendedDepositInstant: string
  }
}

// TODO: need to seperate between success and error response type
export const getMetadata = async (params: GetMetadataParams): Promise<MetadataSuccessResponse> => {
  const stringParams = Object.fromEntries(
    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, value?.toString()]),
  )
  const resp = await fetch(`${BRIDGE_API_ENDPOINT}/v1/metadata?${new URLSearchParams(stringParams).toString()}`)

  return resp.json()
}
