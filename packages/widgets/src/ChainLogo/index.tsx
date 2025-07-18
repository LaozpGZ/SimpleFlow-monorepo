import { HelpIcon } from '@pancakeswap/uikit'
import { memo } from 'react'

export const ChainLogo = memo(
  ({
    chainId,
    width = 24,
    height = 24,
    cdnUrl = 'https://assets.pancakeswap.finance',
  }: {
    chainId?: number
    width?: number
    height?: number
    cdnUrl?: string
  }) => {
    if (chainId) {
      return (
        <img
          alt={`chain-${chainId}`}
          style={{ maxHeight: `${height}px` }}
          src={`${cdnUrl}/web/chains/${chainId}.png`}
          width={width}
          height={height}
        />
      )
    }

    return <HelpIcon width={width} height={height} />
  },
)
