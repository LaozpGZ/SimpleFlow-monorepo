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
  const hasInsufficentBalance = useMemo(() => {
    if (!currency0Balance || !currency1Balance) return false

    if (depositCurrencyAmount0 && currency0Balance.lessThan(depositCurrencyAmount0)) return true
    if (depositCurrencyAmount1 && currency1Balance.lessThan(depositCurrencyAmount1)) return true

    return false
  }, [currency0Balance, currency1Balance, depositCurrencyAmount0, depositCurrencyAmount1])

  // Show Zap widget only for CL pools without hooks, on supported chains, and when user has insufficient balance
  const showZap = useMemo(() => {
    return (
      pool &&
      pool.poolType === 'CL' &&
      hasNoHook &&
      hasInsufficentBalance &&
      lowerTick !== null &&
      upperTick !== null &&
      poolId &&
      chainId &&
      ZAP_INFINITY_CL_SUPPORTED_CHAINS.includes(chainId)
    )
  }, [pool, hasNoHook, hasInsufficentBalance, lowerTick, upperTick, poolId, chainId])

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
