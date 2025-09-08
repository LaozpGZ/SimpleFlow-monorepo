import { ZERO_ADDRESS } from '@pancakeswap/swap-sdk-core'
import { useTokensByChainId } from 'hooks/Tokens'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { supportedPoolsListAtom } from 'views/PCSLimitOrders/state/poolsListAtom'
import { getCurrencyIdWithZeroAddr, getTokensMap } from 'views/PCSLimitOrders/utils'
import { inputCurrencyAtom } from '../state/currency/currencyAtoms'

export const useSupportedTokens = () => {
  const { chainId } = useAccountActiveChain()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const supportedPoolsList = useAtomValue(supportedPoolsListAtom)

  // Supported tokens bi-directional map
  // TODO: Memoize without losing native token in output (Bug)
  const tokenMap = getTokensMap(supportedPoolsList)

  const supportedTokens = useMemo(() => {
    let isNativeInputSupported = false
    let isNativeOutputSupported = false

    const inputTokenAddresses = Object.keys(tokenMap) ?? []
    const outputTokenAddresses = tokenMap[getCurrencyIdWithZeroAddr(inputCurrency)] ?? []

    if (inputTokenAddresses.includes(ZERO_ADDRESS)) {
      inputTokenAddresses.splice(inputTokenAddresses.indexOf(ZERO_ADDRESS))
      isNativeInputSupported = true
    }

    if (outputTokenAddresses.includes(ZERO_ADDRESS)) {
      outputTokenAddresses.splice(outputTokenAddresses.indexOf(ZERO_ADDRESS))
      isNativeOutputSupported = true
    }

    return {
      inputTokenAddresses,
      outputTokenAddresses,
      isNativeInputSupported,
      isNativeOutputSupported,
    }
  }, [tokenMap, inputCurrency])

  const inputTokensMap = useTokensByChainId(supportedTokens.inputTokenAddresses, chainId)
  const outputTokensMap = useTokensByChainId(supportedTokens.outputTokenAddresses, chainId)

  const inputTokens = useMemo(() => Object.values(inputTokensMap).filter((item) => !!item) ?? [], [inputTokensMap])
  const outputTokens = useMemo(() => Object.values(outputTokensMap).filter((item) => !!item) ?? [], [outputTokensMap])

  return useMemo(
    () => ({
      isNativeInputSupported: supportedTokens.isNativeInputSupported,
      isNativeOutputSupported: supportedTokens.isNativeOutputSupported,
      inputTokens,
      outputTokens,
    }),
    [supportedTokens.isNativeInputSupported, supportedTokens.isNativeOutputSupported, inputTokens, outputTokens],
  )
}
