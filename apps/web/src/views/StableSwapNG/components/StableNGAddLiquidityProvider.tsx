import { PoolKey } from '@pancakeswap/infinity-sdk'
import { useState, useCallback, useMemo } from 'react'
import { parseUnits } from 'viem'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallbackFromAmount } from 'hooks/useApproveCallback'
import { CurrencyAmount, Percent } from '@pancakeswap/swap-sdk-core'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { useCurrencyBalancesWithChain } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { CurrencyField as Field } from 'utils/types'
import { useAccount } from 'wagmi'
import StableFormView from 'views/AddLiquidityV3/formViews/StableFormView'
import { useAddLiquidityStableNGPool } from '../hooks/useAddLiquidityStableNGPool'
import { useCalcTokenAmount, useTotalSupply } from '../hooks/useCalcTokenAmount'

export default function StableNGAddLiquidityProvider({ poolKey }: { poolKey: PoolKey }) {
  const { address: account } = useAccount()
  const currencyA = useCurrency(poolKey.currency0)
  const currencyB = useCurrency(poolKey.currency1)

  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')

  // Use the pool hooks address as the pool address
  const poolAddress = poolKey.hooks?.toString() || ''
  const { addLiquidityStableNGPool, isReady } = useAddLiquidityStableNGPool({ poolAddress })

  // Get user's currency balances
  const [balanceA, balanceB] = useCurrencyBalancesWithChain(account, [currencyA, currencyB], currencyA?.chainId)

  const formattedAmounts = useMemo(
    () => ({
      CURRENCY_A: amountA,
      CURRENCY_B: amountB,
    }),
    [amountA, amountB],
  )

  // Parse currency amounts for approvals
  const parsedAmountA = useMemo(() => {
    if (!currencyA || !amountA) return undefined
    try {
      return CurrencyAmount.fromRawAmount(currencyA, parseUnits(amountA, currencyA.decimals))
    } catch {
      return undefined
    }
  }, [currencyA, amountA])

  const parsedAmountB = useMemo(() => {
    if (!currencyB || !amountB) return undefined
    try {
      return CurrencyAmount.fromRawAmount(currencyB, parseUnits(amountB, currencyB.decimals))
    } catch {
      return undefined
    }
  }, [currencyB, amountB])

  // Calculate amounts in bigint for the calc token amount hook
  const amounts = useMemo<[bigint, bigint]>(() => {
    const amountABigint = parsedAmountA?.quotient ?? 0n
    const amountBBigint = parsedAmountB?.quotient ?? 0n
    return [amountABigint, amountBBigint]
  }, [parsedAmountA, parsedAmountB])

  // Use the calc token amount hook for real-time LP token calculation
  const {
    tokenAmount: expectedLP,
    isLoading: isCalculating,
    error: calcError,
  } = useCalcTokenAmount({
    poolAddress,
    amounts,
    deposit: true,
    enabled: isReady && !!(amounts[0] || amounts[1]),
  })

  // Get total supply using the dedicated hook
  const totalSupply = useTotalSupply({ poolAddress })

  // Get user's slippage tolerance setting
  const [userSlippageTolerance] = useUserSlippage()

  // Calculate max amounts that can be spent (accounting for gas reserves for native tokens)
  const maxAmounts = useMemo(() => {
    return [Field.CURRENCY_A, Field.CURRENCY_B].reduce((accumulator, field) => {
      const balance = field === Field.CURRENCY_A ? balanceA : balanceB
      return {
        ...accumulator,
        [field]: maxAmountSpend(balance),
      }
    }, {} as { [field in Field]?: CurrencyAmount<any> })
  }, [balanceA, balanceB])

  // Calculate pool token percentage
  const poolTokenPercentage = useMemo(() => {
    if (expectedLP && totalSupply && totalSupply > 0n) {
      return new Percent(expectedLP, totalSupply + expectedLP)
    }
    return new Percent(0n, 1n) // Default to 0%
  }, [expectedLP, totalSupply])

  // Approval hooks for both tokens using useApproveCallbackFromAmount
  const { approvalState: approvalA, approveCallback: approveACallback } = useApproveCallbackFromAmount({
    token: currencyA?.isToken ? currencyA : undefined,
    minAmount: parsedAmountA?.quotient,
    spender: poolAddress,
  })

  const { approvalState: approvalB, approveCallback: approveBCallback } = useApproveCallbackFromAmount({
    token: currencyB?.isToken ? currencyB : undefined,
    minAmount: parsedAmountB?.quotient,
    spender: poolAddress,
  })

  // Determine if approvals are needed
  const showFieldAApproval = approvalA !== ApprovalState.APPROVED && !!parsedAmountA
  const showFieldBApproval = approvalB !== ApprovalState.APPROVED && !!parsedAmountB
  const shouldShowApprovalGroup = showFieldAApproval || showFieldBApproval

  const handleAddLiquidity = useCallback(async () => {
    if (!currencyA || !currencyB || !parsedAmountA || !parsedAmountB || !expectedLP) return

    try {
      // Calculate minimum mint amount using user's slippage tolerance
      // Convert slippage from basis points (e.g., 50 = 0.5%) to percentage
      const slippagePercent = BigInt(userSlippageTolerance)
      const minMintAmount = (expectedLP * (10000n - slippagePercent)) / 10000n

      // Add liquidity
      const txHash = await addLiquidityStableNGPool(parsedAmountA.quotient, parsedAmountB.quotient, minMintAmount)
      console.log('Add liquidity successful, tx hash:', txHash)
    } catch (error) {
      console.error('Add liquidity failed:', error)
    }
  }, [currencyA, currencyB, parsedAmountA, parsedAmountB, expectedLP, addLiquidityStableNGPool, userSlippageTolerance])

  return (
    <>
      <StableFormView
        formattedAmounts={formattedAmounts}
        onFieldAInput={setAmountA}
        onFieldBInput={setAmountB}
        maxAmounts={maxAmounts}
        currencies={{
          CURRENCY_A: currencyA ?? undefined,
          CURRENCY_B: currencyB ?? undefined,
        }}
        buttonDisabled={
          !isReady ||
          !amountA ||
          !amountB ||
          isCalculating ||
          !expectedLP ||
          !!calcError ||
          approvalA === ApprovalState.PENDING ||
          approvalB === ApprovalState.PENDING ||
          showFieldAApproval ||
          showFieldBApproval
        }
        onAdd={handleAddLiquidity}
        onPresentAddLiquidityModal={() => handleAddLiquidity()}
        errorText={
          !isReady
            ? 'Pool not ready'
            : !amountA || !amountB
            ? 'Please enter amounts'
            : isCalculating
            ? 'Calculating LP tokens...'
            : calcError
            ? 'Error calculating LP tokens'
            : !expectedLP
            ? 'Unable to calculate LP tokens'
            : approvalA === ApprovalState.PENDING || approvalB === ApprovalState.PENDING
            ? 'Waiting for approval...'
            : showFieldAApproval || showFieldBApproval
            ? 'Approval required'
            : undefined
        }
        inputAmountsTotalUsdValue={0}
        shouldShowApprovalGroup={shouldShowApprovalGroup}
        showFieldAApproval={showFieldAApproval}
        approvalA={approvalA}
        showFieldBApproval={showFieldBApproval}
        approvalB={approvalB}
        approveBCallback={approveBCallback}
        approveACallback={approveACallback}
        loading={false}
        poolTokenPercentage={poolTokenPercentage}
        executionSlippage={new Percent(userSlippageTolerance, 10000)}
      />
    </>
  )
}
