import { Box, Card, CardBody, Column, Row, RowBetween, Text } from '@pancakeswap/uikit'
import { useCurrencyByPoolId } from 'hooks/infinity/useCurrencyByPoolId'
import { useMemo } from 'react'
import { useInverted, useClRangeQueryState } from 'state/infinity/shared'
import styled from 'styled-components'
import { Address, zeroAddress } from 'viem'
import { MevProtectToggle } from 'views/Mev/MevProtectToggle'
import { ZapLiquidityWidget } from 'components/ZapLiquidityWidget'
import { usePoolKeyByPoolId } from 'hooks/infinity/usePoolKeyByPoolId'
import { useCurrencyBalances } from 'state/wallet/hooks'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { isAddressEqual } from 'utils'
import { PoolType } from '@kyberswap/pancake-liquidity-widgets'
import { ZAP_INFINITY_CL_SUPPORTED_CHAINS } from 'config/constants/zap'
import { useAddDepositAmounts } from '../hooks/useAddDepositAmounts'
import { usePool } from '../hooks/usePool'
import { SubmitButton } from './SubmitButton'
import { FieldAddDepositAmount } from './FieldAddDepositAmount'

const StyledCard = styled(Card)`
  height: fit-content;
`

interface InfinityDepositPanelProps {
  poolId?: Address
  chainId?: number
}

export const InfinityDepositPanel = ({ poolId, chainId }: InfinityDepositPanelProps) => {
  const { currency0: currency0Base, currency1: currency1Base } = useCurrencyByPoolId({ chainId, poolId })
  const [inverted] = useInverted()

  const currency0 = useMemo(() => (inverted ? currency1Base : currency0Base), [inverted, currency0Base, currency1Base])
  const currency1 = useMemo(() => (inverted ? currency0Base : currency1Base), [inverted, currency0Base, currency1Base])

  // Get pool and check if it's CL type
  const pool = usePool<'CL'>()
  const { data: poolKey } = usePoolKeyByPoolId(poolId, chainId, 'CL')
  const [{ lowerTick, upperTick }] = useClRangeQueryState()
  const { inputValue0, inputValue1, depositCurrencyAmount0, depositCurrencyAmount1 } = useAddDepositAmounts()
  const { account } = useAccountActiveChain()
  const [currency0Balance, currency1Balance] = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [currency0, currency1], [currency0, currency1]),
  )

  // Check if pool has no hook
  const hasNoHook = useMemo(() => {
    if (!poolKey) return false
    return !poolKey.hooks || isAddressEqual(poolKey.hooks, zeroAddress)
  }, [poolKey])

  // Check if user has insufficient balance
  // When inverted, currency0Balance/currency1Balance are swapped but depositCurrencyAmount0/depositCurrencyAmount1
  // are always in pool's natural order, so we need to swap the comparison
  const hasInsufficientBalance = useMemo(() => {
    if (!currency0Balance || !currency1Balance) return false

    // When inverted: currency0Balance is for pool's token1, currency1Balance is for pool's token0
    // depositCurrencyAmount0 is for pool's token0, depositCurrencyAmount1 is for pool's token1
    const amount0ToCheck = inverted ? depositCurrencyAmount1 : depositCurrencyAmount0
    const amount1ToCheck = inverted ? depositCurrencyAmount0 : depositCurrencyAmount1

    if (amount0ToCheck && currency0Balance.lessThan(amount0ToCheck)) return true
    if (amount1ToCheck && currency1Balance.lessThan(amount1ToCheck)) return true

    return false
  }, [currency0Balance, currency1Balance, depositCurrencyAmount0, depositCurrencyAmount1, inverted])

  // Show Zap widget only for CL pools without hooks, on supported chains, and when user has insufficient balance
  const showZap = useMemo(() => {
    return (
      pool &&
      pool.poolType === 'CL' &&
      hasNoHook &&
      hasInsufficientBalance &&
      lowerTick !== null &&
      upperTick !== null &&
      poolId &&
      chainId &&
      ZAP_INFINITY_CL_SUPPORTED_CHAINS.includes(chainId)
    )
  }, [pool, hasNoHook, hasInsufficientBalance, lowerTick, upperTick, poolId, chainId])

  return (
    <StyledCard>
      <CardBody>
        {showZap && (
          <Box mb="16px">
            <ZapLiquidityWidget
              poolId={poolId}
              poolType={PoolType.DEX_PANCAKE_INFINITY_CL}
              tickLower={lowerTick ?? undefined}
              tickUpper={upperTick ?? undefined}
              baseCurrency={currency0}
              baseCurrencyAmount={inputValue0}
              quoteCurrency={currency1}
              quoteCurrencyAmount={inputValue1}
            />
          </Box>
        )}
        <FieldAddDepositAmount baseCurrency={currency0} quoteCurrency={currency1} />
        <Box mt="16px">
          <MevProtectToggle size="sm" />
        </Box>
        <SubmitButton mt="16px" />
      </CardBody>
    </StyledCard>
  )
}
