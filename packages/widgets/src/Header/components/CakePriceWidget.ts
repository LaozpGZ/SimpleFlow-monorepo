import { CakePriceWidget as UikitCakePriceWidget } from '@pancakeswap/uikit'

export type CakePriceWidgetProps = {
  cakePriceUsd?: number
  chainId: number
  showSkeleton?: boolean
}

export const CakePriceWidget: React.FC<CakePriceWidgetProps> = UikitCakePriceWidget
