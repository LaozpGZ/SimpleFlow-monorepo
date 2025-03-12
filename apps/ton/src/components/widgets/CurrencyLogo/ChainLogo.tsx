import { Box, HelpIcon } from '@pancakeswap/uikit'
import { memo } from 'react'
import { SpaceProps } from 'styled-system'

export const ChainLogo = memo(
  ({
    chainId,
    width = 24,
    height = 24,
    ...props
  }: { chainId?: number; width?: number; height?: number } & SpaceProps) => {
    const icon = chainId ? (
      <img
        alt={`chain-${chainId}`}
        style={{ maxHeight: `${height}px` }}
        src={`https://assets.pancakeswap.finance/web/chains/${chainId}.png`}
        width={width}
        height={height}
      />
    ) : (
      <HelpIcon width={width} height={height} />
    )
    return <Box {...props}>{icon}</Box>
  },
)
