import { Protocol } from '@pancakeswap/farms'
import { PositionHeader } from 'views/PositionInfinity/components/PositionHeader'
import { PoolKey } from '@pancakeswap/infinity-sdk'
import { useCurrency } from 'hooks/Tokens'
import { useMemo } from 'react'

export const InfinityStablePoolHeader = ({
  poolKey,
  chainId,
  poolId,
}: {
  poolKey: PoolKey
  chainId: number
  poolId: `0x${string}`
}) => {
  const isOwnNFT = true
  const inRange = true
  const isFarming = true
  const removed = false

  const tokenId = 1
  const currency0 = useCurrency(poolKey.currency0)
  const currency1 = useCurrency(poolKey.currency1)
  const feeAmount = 0

  const hookData = useMemo(() => {
    if (!poolKey.hooks) {
      return undefined
    }
    return {
      address: poolKey.hooks,
    }
  }, [poolKey.hooks])

  return (
    <>
      <PositionHeader
        isOwner={isOwnNFT}
        isOutOfRange={!inRange}
        isFarming={isFarming && !removed}
        protocol={Protocol.InfinityCLAMM}
        currency0={currency0}
        currency1={currency1}
        chainId={chainId}
        feeTier={feeAmount}
        dynamic={false}
        isRemoved={removed}
        hookData={hookData}
        poolId={poolId}
        tokenId={tokenId ? Number(tokenId) : undefined}
      />
    </>
  )
}
