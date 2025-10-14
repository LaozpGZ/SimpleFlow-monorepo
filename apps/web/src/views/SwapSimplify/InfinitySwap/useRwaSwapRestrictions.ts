import { ChainId } from '@pancakeswap/chains'
import { Token, UnifiedCurrency, WNATIVE } from '@pancakeswap/sdk'
import { useUnifiedNativeCurrency } from 'hooks/useNativeCurrency'
import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { USDT, USDON } from '@pancakeswap/tokens'
import { isRwaTokenAtom } from 'quoter/atom/rwaTokenAtoms'

type RwaPanelConfig = {
  tokensToShow?: Token[]
  supportCrossChain: boolean
  showCommonBases: boolean
}

export const useRwaSwapRestrictions = (
  inputCurrency?: UnifiedCurrency | null,
  outputCurrency?: UnifiedCurrency | null,
): {
  inputConfig: RwaPanelConfig
  outputConfig: RwaPanelConfig
} => {
  const inputIsRwa = useAtomValue(
    useMemo(
      () =>
        isRwaTokenAtom({
          chainId: inputCurrency?.chainId ?? 0,
          address: inputCurrency?.wrapped?.address ?? '',
        }),
      [inputCurrency?.chainId, inputCurrency?.wrapped?.address],
    ),
  )
  const outputIsRwa = useAtomValue(
    useMemo(
      () =>
        isRwaTokenAtom({
          chainId: outputCurrency?.chainId ?? 0,
          address: outputCurrency?.wrapped?.address ?? '',
        }),
      [outputCurrency?.chainId, outputCurrency?.wrapped?.address],
    ),
  )

  const rwaChainId = inputIsRwa ? inputCurrency?.chainId : outputCurrency?.chainId

  // const rwaChainId = ChainId.BSC
  const wBnb = rwaChainId ? WNATIVE[rwaChainId] : undefined
  const bscUsdt = USDT[rwaChainId]
  const usdOnToken = USDON[rwaChainId]

  const baseWhitelist = useMemo(() => {
    const list: Token[] = []
    if (bscUsdt) {
      list.push(bscUsdt)
    }
    if (usdOnToken) {
      list.push(usdOnToken)
    }
    if (wBnb) {
      list.push(wBnb)
    }
    return list
  }, [bscUsdt, usdOnToken, wBnb])

  return useMemo(
    () => ({
      inputConfig: {
        tokensToShow: outputIsRwa ? baseWhitelist : undefined,
        supportCrossChain: !outputIsRwa,
        showCommonBases: !outputIsRwa,
      },
      outputConfig: {
        tokensToShow: inputIsRwa ? baseWhitelist : undefined,
        supportCrossChain: !inputIsRwa,
        showCommonBases: !inputIsRwa,
      },
    }),
    [baseWhitelist, inputIsRwa, outputIsRwa],
  )
}

export type { RwaPanelConfig }
