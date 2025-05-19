import { PriceOrder, zeroAddress } from '@pancakeswap/price-api-sdk'
import { Currency, ERC20Token, Native } from '@pancakeswap/sdk'

import { GELATO_NATIVE } from 'config/constants'
import { useCallback, useMemo } from 'react'

import { useTranslation } from '@pancakeswap/localization'
import { useQuery } from '@tanstack/react-query'
import { useAllTokensByChainIds } from 'hooks/Tokens'
import { safeGetAddress } from 'utils'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { publicClient } from 'utils/wagmi'
import { Address, erc20Abi } from 'viem'
import { BridgeStatus, BridgeStatusData, Command } from '../../types'
import { TimelineItemStatus } from '../components/Timeline'

interface UseTimelineItemsProps {
  bridgeStatus?: BridgeStatusData
  order?: PriceOrder | null
}
export const useTimelineItems = ({ bridgeStatus, order }: UseTimelineItemsProps) => {
  const { t } = useTranslation()

  const allTokens = useAllTokensByChainIds([
    bridgeStatus?.originChainId || order?.trade.inputAmount.currency.chainId || 0,
    bridgeStatus?.destinationChainId || order?.trade.outputAmount.currency.chainId || 0,
  ])

  const stepTokenKey = (chainId: number, address: Address) => {
    return `${chainId}-${address}`
  }

  const getCurrencyByAddress = useCallback(
    async (chainId: number, address: Address): Promise<Currency | undefined> => {
      // Check if it is a native currency
      const native = Native.onChain(chainId)
      const isNative = address?.toLowerCase() === zeroAddress || address?.toLowerCase() === GELATO_NATIVE
      if (isNative) return native

      if (
        address === bridgeStatus?.inputCurrencyAmount?.currency.wrapped.address &&
        chainId === bridgeStatus?.inputCurrencyAmount?.currency.chainId
      ) {
        return bridgeStatus?.inputCurrencyAmount?.currency
      }
      if (
        address === bridgeStatus?.outputCurrencyAmount?.currency.wrapped.address &&
        chainId === bridgeStatus?.outputCurrencyAmount?.currency.chainId
      ) {
        return bridgeStatus?.outputCurrencyAmount?.currency
      }

      if (allTokens) {
        const token = allTokens?.[chainId]?.[safeGetAddress(address) || '']
        if (token) return token
      }

      //   Else, read name, symbol and decimals from contract
      try {
        const chainClient = publicClient({ chainId })

        const [name, symbol, decimals] = await chainClient.multicall({
          allowFailure: false,
          contracts: [
            {
              address,
              abi: erc20Abi,
              functionName: 'name',
            },
            {
              address,
              abi: erc20Abi,
              functionName: 'symbol',
            },
            {
              address,
              abi: erc20Abi,
              functionName: 'decimals',
            },
          ],
        })

        return new ERC20Token(chainId, address, decimals ?? 18, symbol ?? '', name ?? '')
      } catch (error) {
        console.error(error)
        return undefined
      }
    },
    [allTokens, bridgeStatus?.inputCurrencyAmount, bridgeStatus?.outputCurrencyAmount],
  )

  const { data: tokenMapping } = useQuery({
    queryKey: ['tokenMapping', bridgeStatus?.data],
    queryFn: async () => {
      const steps = bridgeStatus?.data
      if (!steps) return {}

      const tokenMapping = {}
      for (const step of steps) {
        if (step.command === Command.SWAP) {
          // eslint-disable-next-line no-await-in-loop
          const [inputToken, outputToken] = await Promise.all([
            getCurrencyByAddress(step.metadata.chainId, step.metadata.inputToken),
            getCurrencyByAddress(step.metadata.chainId, step.metadata.outputToken),
          ])
          tokenMapping[stepTokenKey(step.metadata.chainId, step.metadata.inputToken)] = inputToken
          tokenMapping[stepTokenKey(step.metadata.chainId, step.metadata.outputToken)] = outputToken
        } else if (step.command === Command.BRIDGE) {
          // TODO: Implement after getting input and output token addresses from Backend team
          //   const token = await getCurrencyByAddress(step.metadata.originChainId, step.metadata.inputToken)
          //   tokenMapping[stepTokenKey(step.metadata.originChainId, step.metadata.inputToken)] = token
        }
      }
      return tokenMapping
    },
    initialData: {},
    notifyOnChangeProps: ['data'],
  })

  const timelineItems = useMemo(() => {
    return (
      bridgeStatus?.data?.map((step, i) => {
        const getText = () => {
          switch (step.command) {
            case Command.SWAP: {
              const variables = {
                currencyA: tokenMapping[stepTokenKey(step.metadata.chainId, step.metadata.inputToken)]?.symbol || '', // TODO: Get output of bridged token... can be different if prev swap step present
                currencyB: tokenMapping[stepTokenKey(step.metadata.chainId, step.metadata.outputToken)]?.symbol || '',
                chainName: getFullChainNameById(step.metadata.chainId),
              }

              if (step.status.code === BridgeStatus.SUCCESS) {
                return t('Swapped %currencyA% to %currencyB% (%chainName%)', variables)
              }
              return t('Swap %currencyA% to %currencyB% (%chainName%)', variables)
            }
            case Command.BRIDGE:
              return t('Bridge %currency% (%inputChain% to %outputChain%)', {
                currency: order?.trade.inputAmount.currency.symbol || '', // TODO: Verify this currency symbol for Swap->Bridge?-> Cases
                inputChain: getFullChainNameById(step.metadata.originChainId),
                outputChain: getFullChainNameById(step.metadata.destinationChainId),
              })
            default:
              return ''
          }
        }

        const getStatus = (): TimelineItemStatus => {
          const stepStatus = step.status.code

          // If previous step is not completed or unsuccessful, then this step is not started
          if (
            (stepStatus === BridgeStatus.PENDING || stepStatus === BridgeStatus.BRIDGE_PENDING) &&
            bridgeStatus?.data?.[i - 1]?.status.code !== BridgeStatus.SUCCESS
          ) {
            return 'notStarted'
          }

          switch (stepStatus) {
            case BridgeStatus.SUCCESS:
              return 'completed'
            case BridgeStatus.PARTIAL_SUCCESS:
              return 'warning'
            case BridgeStatus.FAILED:
              return 'failed'
            case BridgeStatus.PENDING:
            case BridgeStatus.BRIDGE_PENDING:
              return 'inProgress'
            default:
              return 'notStarted'
          }
        }

        const timelineStatus = getStatus()

        // TODO: Get and Handle error codes
        const failureMessage =
          step.status.code === BridgeStatus.FAILED
            ? 'Failed'
            : step.status.code === BridgeStatus.PARTIAL_SUCCESS
            ? 'Partial Success'
            : undefined

        return {
          id: step.command,
          title: getText(),
          status: timelineStatus,
          isLast: bridgeStatus?.data && step.command === bridgeStatus?.data[bridgeStatus?.data.length - 1]?.command,
          ...(failureMessage
            ? timelineStatus === 'failed'
              ? { errorMessage: failureMessage }
              : { warningMessage: failureMessage }
            : undefined),
          tx: {
            hash: step.command === Command.SWAP ? step.metadata.tx : step.metadata.depositTxHash,
            chainId: step.command === Command.SWAP ? step.metadata.chainId : step.metadata.originChainId,
          },
        }
      }) ?? []
    )
  }, [bridgeStatus, order, t, tokenMapping])

  return timelineItems
}
