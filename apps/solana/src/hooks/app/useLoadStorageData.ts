import { useEffect } from 'react'
import { SWAP_SLIPPAGE_KEY, useSwapStore } from '@/features/Swap/useSwapStore'
import { APR_MODE_KEY, DURABLE_NONCE_KEY, EXPLORER_KEY, FEE_KEY, useAppStore, USER_ADDED_KEY } from '@/store/useAppStore'
import { LIQUIDITY_SLIPPAGE_KEY, useLiquidityStore } from '@/store/useLiquidityStore'
import { getStorageItem } from '@/utils/localStorage'

export default function useLoadStorageData() {
  useEffect(() => {
    const [explorerUrl, aprMode, userAdded, transactionFee, durableNonce, liquiditySlippage, swapSlippage] = [
      getStorageItem(EXPLORER_KEY),
      getStorageItem(APR_MODE_KEY),
      getStorageItem(USER_ADDED_KEY),
      getStorageItem(FEE_KEY),
      getStorageItem(DURABLE_NONCE_KEY),
      getStorageItem(LIQUIDITY_SLIPPAGE_KEY),
      getStorageItem(SWAP_SLIPPAGE_KEY)
    ]

    useAppStore.setState({
      ...(explorerUrl ? { explorerUrl } : {}),
      ...(aprMode ? { aprMode: aprMode as 'M' | 'D' } : {}),
      ...(transactionFee ? { transactionFee } : {}),
      ...(durableNonce !== null ? { useDurableNonce: durableNonce === 'true' } : {}),
      ...(userAdded
        ? {
            displayTokenSettings: {
              ...useAppStore.getState().displayTokenSettings,
              userAdded: userAdded === 'true'
            }
          }
        : {})
    })

    if (liquiditySlippage) {
      useLiquidityStore.setState({
        slippage: Number(liquiditySlippage)
      })
    }
    if (swapSlippage)
      useSwapStore.setState({
        slippage: Number(swapSlippage)
      })
  }, [])
}
