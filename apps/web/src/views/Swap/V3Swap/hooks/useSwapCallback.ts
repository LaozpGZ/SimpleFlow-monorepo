import { useTranslation } from '@pancakeswap/localization'
import { FeeOptions } from '@pancakeswap/v3-sdk'
import { useMemo } from 'react'

import { useSwapState } from 'state/swap/hooks'
import { basisPointsToPercent } from 'utils/exchange'

import { ClassicOrder } from '@pancakeswap/price-api-sdk'
import { Permit2Signature } from '@pancakeswap/universal-router-sdk'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useAutoSlippageWithFallback } from 'hooks/useAutoSlippageWithFallback'
import { Address } from 'viem'
import { ChainId as EvmChainId } from '@pancakeswap/chains'
import useSendSwapTransaction from './useSendSwapTransaction'
import { SwapCall, useSwapCallArgumentsFactory } from './useSwapCallArguments'
import type { TWallchainMasterInput, WallchainStatus } from './useWallchain'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
  REVERTED,
}

interface UseSwapCallbackReturns {
  state: SwapCallbackState
  callback?: (permitSignature: Permit2Signature | undefined) => Promise<{ hash: Address }>
  getSwapCalls?: (permitSignature: Permit2Signature | undefined) => SwapCall[]
  error?: string
  reason?: string
}

interface UseSwapCallbackArgs {
  trade: ClassicOrder['trade'] | undefined | null // trade to execute, required
  deadline?: bigint
  feeOptions?: FeeOptions
  onWallchainDrop?: () => void
  statusWallchain?: WallchainStatus
  wallchainMasterInput?: TWallchainMasterInput
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback({ trade, deadline, feeOptions }: UseSwapCallbackArgs): UseSwapCallbackReturns {
  const { t } = useTranslation()
  const { account, chainId } = useAccountActiveChain()
  const { slippageTolerance: allowedSlippageRaw } = useAutoSlippageWithFallback()
  const { recipient: recipientAddress } = useSwapState()
  const recipient = recipientAddress === null ? account : recipientAddress

  const getSwapCalls = useSwapCallArgumentsFactory(
    trade,
    basisPointsToPercent(allowedSlippageRaw),
    recipientAddress,
    deadline,
    feeOptions,
  )

  const { callback } = useSendSwapTransaction(account, chainId, trade ?? undefined, getSwapCalls, 'UniversalRouter')

  return useMemo(() => {
    if (!trade || !account || !chainId || !callback || !(chainId in EvmChainId)) {
      return { state: SwapCallbackState.INVALID, error: t('Missing dependencies') }
    }
    if (!recipient) {
      if (recipientAddress !== null) {
        return { state: SwapCallbackState.INVALID, error: t('Invalid recipient') }
      }
      return { state: SwapCallbackState.LOADING }
    }

    return {
      state: SwapCallbackState.VALID,
      callback,
      getSwapCalls,
    }
  }, [getSwapCalls, trade, account, chainId, callback, recipient, recipientAddress, t])
}
