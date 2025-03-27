import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { Percent } from '@pancakeswap/swap-sdk-core'
import { Text } from '@pancakeswap/uikit'
import { FeeTierTooltip } from '@pancakeswap/widgets-internal'
import { usePoolById } from 'hooks/infinity/usePool'
import { useMemo } from 'react'
import { Address } from 'viem'

interface FeeTierBreakdownProps {
  poolId?: Address
  chainId?: number
}
export const InfinityFeeTierBreakdown = ({ poolId, chainId }: FeeTierBreakdownProps) => {
  const { t } = useTranslation()
  const [, pool] = usePoolById(poolId, chainId)

  /* eslint-disable no-bitwise */
  const [protocolFee, lpFee] = useMemo(() => [(pool?.protocolFee ?? 0) & 0xfff, pool?.fee ?? 0], [pool])

  const percent = useMemo(() => {
    const totalFee = (protocolFee + ((1e6 - protocolFee) * lpFee) / 1e6).toFixed(0)
    return new Percent(totalFee, 1e6)
  }, [protocolFee, lpFee])

  const type = useMemo(
    () => (pool?.poolType === 'Bin' ? Protocol.InfinityBIN : Protocol.InfinityCLAMM),
    [pool?.poolType],
  )
  const protocol = useMemo(() => (pool?.poolType === 'Bin' ? 'Infinity LBAMM' : 'Infinity CLAMM'), [pool?.poolType])

  const tooltips = useMemo(() => {
    return (
      <>
        <Text bold> {t('%t% LP', { t: protocol.toUpperCase() })}</Text>
        <Text> - {t('%p%% LP Fee', { p: new Percent(lpFee, 1e6).toSignificant(2) })}</Text>
        <Text> - {t('%p%% Protocol Fee', { p: new Percent(protocolFee, 1e6).toSignificant(2) })}</Text>
      </>
    )
  }, [lpFee, protocolFee, t, protocol])

  if (!pool) {
    return null
  }

  return <FeeTierTooltip tooltips={tooltips} dynamic={pool?.dynamic} type={type} percent={percent} />
}
