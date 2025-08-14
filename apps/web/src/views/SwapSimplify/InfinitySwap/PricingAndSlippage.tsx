import { useModal } from '@pancakeswap/uikit'
import { SwapUIV2 } from '@pancakeswap/widgets-internal'

import { Currency, Price } from '@pancakeswap/sdk'
import { memo } from 'react'

import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import { useAutoSlippageWithFallback } from 'hooks/useAutoSlippageWithFallback'
import { SettingsModalV2 } from 'components/Menu/GlobalSettings/SettingsModalV2'
import { useIsWrapping } from '../../Swap/V3Swap/hooks'

interface Props {
  showSlippage?: boolean
  priceLoading?: boolean
  price?: Price<Currency, Currency>
}

export const PricingAndSlippage = memo(function PricingAndSlippage({
  priceLoading,
  price,
  showSlippage = true,
}: Props) {
  const { slippageTolerance: allowedSlippage } = useAutoSlippageWithFallback()

  const isWrapping = useIsWrapping()
  const [onPresentSettingsModal] = useModal(<SettingsModalV2 mode={SettingsMode.GLOBAL} />)

  if (isWrapping || !price) {
    return null
  }

  const priceNode = price ? (
    <>
      <SwapUIV2.TradePrice price={price} loading={priceLoading} />
    </>
  ) : null

  return (
    <SwapUIV2.SwapInfo
      price={priceNode}
      allowedSlippage={showSlippage ? allowedSlippage : undefined}
      onSlippageClick={onPresentSettingsModal}
    />
  )
})
