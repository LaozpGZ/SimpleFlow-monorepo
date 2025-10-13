import { useState, useCallback, useMemo, useEffect } from 'react'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState } from 'hooks/useApproveCallback'
import { CurrencyAmount, Percent, Token } from '@pancakeswap/swap-sdk-core'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { useTranslation } from '@pancakeswap/localization'
import {
  useModal,
  ArrowDownIcon,
  AutoColumn,
  AutoRow,
  Box,
  Button,
  CardBody,
  ColumnCenter,
  Flex,
  Slider,
  Text,
  useMatchBreakpoints,
  ArrowForwardIcon,
  PreTitle,
  Card,
  BalanceInput,
} from '@pancakeswap/uikit'
import { useTransactionAdder } from 'state/transactions/hooks'
import { isUserRejected, logError } from 'utils/sentry'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import { Field } from 'state/burn/actions'
import { LightGreyCard } from 'components/Card'
import { RowBetween } from 'components/Layout/Row'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { CommitButton } from 'components/CommitButton'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { LiquiditySlippageButton } from 'views/Swap/components/SlippageButton'
import { styled } from 'styled-components'
import { useDebouncedChangeHandler } from '@pancakeswap/hooks'
import { useTotalPriceUSD } from 'hooks/useTotalPriceUSD'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { calculateSlippageAmount } from 'utils/exchange'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import ConfirmLiquidityModal from 'components/Liquidity/ConfirmRemoveLiquidityModal'
import CurrencyInputPanelSimplify from 'components/CurrencyInputPanelSimplify'
import { useRemoveLiquidityInfinityStablePool } from '../hooks/useRemoveLiquidityInfinityStablePool'
import { useCalcTokenAmount, useUserLPBalance, useTotalSupply, usePoolBalances } from '../hooks/useCalcTokenAmount'
import { CardCheckBox } from './shared/CardCheckBox'
import { RemoveMode } from '../types/removeMode'

const BorderCard = styled.div`
  border: solid 1px ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 16px;
`

export default function InfinityStableRemoveLiquidityProvider({
  currencyId0,
  currencyId1,
  hookAddress,
}: {
  currencyId0: string
  currencyId1: string
  hookAddress: string
}) {
  const { account, isWrongNetwork } = useAccountActiveChain()
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  const currencyA = useCurrency(currencyId0)
  const currencyB = useCurrency(currencyId1)

  const [percentToRemove, setPercentToRemove] = useState(0)
  const [removeMode, setRemoveMode] = useState<RemoveMode>(RemoveMode.BALANCE)
  const [selectedCoinIndex, setSelectedCoinIndex] = useState<0 | 1>(0)
  const [customAmount0, setCustomAmount0] = useState('')
  const [customAmount1, setCustomAmount1] = useState('')

  // modal and loading state
  const [{ attemptingTxn, liquidityErrorMessage, txHash }, setLiquidityState] = useState<{
    attemptingTxn: boolean
    liquidityErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    attemptingTxn: false,
    liquidityErrorMessage: undefined,
    txHash: undefined,
  })

  // Use the pool hooks address as the pool address
  const poolAddress = hookAddress

  const {
    estimateRemoveLiquidityGas,
    removeLiquidityInfinityStablePool,
    calcWithdrawOneCoin,
    removeLiquidityOneCoin,
    removeLiquidityImbalance,
    isReady,
  } = useRemoveLiquidityInfinityStablePool({ poolAddress })

  // Transaction adder
  const addTransaction = useTransactionAdder()

  // Get user's LP balance
  const userLPBalance = useUserLPBalance({ poolAddress, account })

  // Get total supply and pool balances
  const totalSupply = useTotalSupply({ poolAddress })
  const [balance0, balance1] = usePoolBalances({ poolAddress })

  // Calculate LP amount to burn based on percentage
  const lpAmountToBurn = useMemo(() => {
    if (!userLPBalance || percentToRemove === 0) return 0n
    return (userLPBalance * BigInt(percentToRemove)) / 100n
  }, [userLPBalance, percentToRemove])

  // Get user's slippage tolerance setting
  const [userSlippageTolerance] = useUserSlippage()

  // Calculate expected withdrawn amounts based on pool balances and total supply
  // Formula: amountWithdrawn = lpAmountToBurn * balance / totalSupply
  const [amount0Withdrawn, amount1Withdrawn] = useMemo<[bigint, bigint]>(() => {
    if (!totalSupply || totalSupply === 0n || !balance0 || !balance1 || lpAmountToBurn === 0n) {
      return [0n, 0n]
    }
    const amount0 = (lpAmountToBurn * balance0) / totalSupply
    const amount1 = (lpAmountToBurn * balance1) / totalSupply
    return [amount0, amount1]
  }, [lpAmountToBurn, balance0, balance1, totalSupply])

  const amounts = useMemo<[bigint, bigint]>(() => {
    return [amount0Withdrawn, amount1Withdrawn]
  }, [amount0Withdrawn, amount1Withdrawn])

  console.log('lpAmountToBurn', lpAmountToBurn)

  // Calculate expected token amounts using calc_token_amount with deposit=false
  // For stable swap removal, we need to calculate the amounts we'll receive
  const { tokenAmount: expectedTokensOut, error: calcError } = useCalcTokenAmount({
    poolAddress,
    amounts,
    deposit: false,
    enabled: isReady && lpAmountToBurn > 0n,
  })

  // Parse expected amounts for currencies based on calculated withdrawn amounts
  const parsedAmountA = useMemo(() => {
    if (!currencyA || amount0Withdrawn === 0n) return undefined
    return CurrencyAmount.fromRawAmount(currencyA, amount0Withdrawn)
  }, [currencyA, amount0Withdrawn])

  const parsedAmountB = useMemo(() => {
    if (!currencyB || amount1Withdrawn === 0n) return undefined
    return CurrencyAmount.fromRawAmount(currencyB, amount1Withdrawn)
  }, [currencyB, amount1Withdrawn])

  // OneCoin mode: Calculate amount for single coin withdrawal
  const [oneCoinAmount, setOneCoinAmount] = useState<bigint>(0n)
  useEffect(() => {
    const fetchOneCoinAmount = async () => {
      if (removeMode === RemoveMode.ONE_COIN && lpAmountToBurn > 0n && isReady) {
        try {
          const amount = await calcWithdrawOneCoin(lpAmountToBurn, selectedCoinIndex)
          console.log('calcWithdrawOneCoin amount', amount)
          setOneCoinAmount(amount)
        } catch (error) {
          console.error('Error calculating one coin amount:', error)
          setOneCoinAmount(0n)
        }
      } else {
        setOneCoinAmount(0n)
      }
    }
    fetchOneCoinAmount()
  }, [removeMode, lpAmountToBurn, selectedCoinIndex, calcWithdrawOneCoin, isReady])

  // Custom mode: Parse custom input amounts
  const customAmount0Parsed = useMemo(() => {
    if (!currencyA || !customAmount0) return 0n
    try {
      return BigInt(Math.floor(parseFloat(customAmount0) * 10 ** currencyA.decimals))
    } catch {
      return 0n
    }
  }, [customAmount0, currencyA])

  const customAmount1Parsed = useMemo(() => {
    if (!currencyB || !customAmount1) return 0n
    try {
      return BigInt(Math.floor(parseFloat(customAmount1) * 10 ** currencyB.decimals))
    } catch {
      return 0n
    }
  }, [customAmount1, currencyB])

  const amountsCustom = useMemo<[bigint, bigint]>(() => {
    return [customAmount0Parsed, customAmount1Parsed]
  }, [customAmount0Parsed, customAmount1Parsed])

  // Custom mode: Calculate max burn amount
  const { tokenAmount: customMaxBurnAmount } = useCalcTokenAmount({
    poolAddress,
    amounts: amountsCustom,
    deposit: false,
    enabled: removeMode === RemoveMode.CUSTOM && (customAmount0Parsed > 0n || customAmount1Parsed > 0n),
  })

  // Create a mock LP token for approval
  const lpToken = useMemo(() => {
    if (!currencyA || !poolAddress) return undefined
    return new Token(currencyA.chainId, poolAddress as `0x${string}`, 18, 'LP', 'LP Token')
  }, [currencyA, poolAddress])

  const lpTokenAmount = useMemo(() => {
    if (!lpToken || !lpAmountToBurn) return undefined
    return CurrencyAmount.fromRawAmount(lpToken, lpAmountToBurn)
  }, [lpToken, lpAmountToBurn])

  // TODO: confirm with team if need it
  // Approval hook for LP tokens
  // const { approvalState, approveCallback } = useApproveCallback(lpTokenAmount, poolAddress)

  const approvalState = ApprovalState.APPROVED
  const approveCallback = () => {
    console.log('approveCallback')
  }

  const onRemove = useCallback(async () => {
    if (!currencyA || !currencyB) return

    setLiquidityState({ attemptingTxn: true, liquidityErrorMessage: undefined, txHash: undefined })

    try {
      let response: string
      const symbolA = currencyA?.symbol
      const symbolB = currencyB?.symbol
      let amountA = '0'
      let amountB = '0'

      if (removeMode === RemoveMode.BALANCE) {
        if (!lpAmountToBurn || lpAmountToBurn === 0n) return
        const minAmount0 = parsedAmountA ? calculateSlippageAmount(parsedAmountA, userSlippageTolerance)[0] : 0n
        const minAmount1 = parsedAmountB ? calculateSlippageAmount(parsedAmountB, userSlippageTolerance)[0] : 0n

        response = await removeLiquidityInfinityStablePool(lpAmountToBurn, minAmount0, minAmount1)
        amountA = parsedAmountA?.toSignificant(3) || '0'
        amountB = parsedAmountB?.toSignificant(3) || '0'
      } else if (removeMode === RemoveMode.ONE_COIN) {
        if (!lpAmountToBurn || lpAmountToBurn === 0n || oneCoinAmount === 0n) return
        const selectedCurrency = selectedCoinIndex === 0 ? currencyA : currencyB
        const parsedOneCoinAmount = CurrencyAmount.fromRawAmount(selectedCurrency, oneCoinAmount)
        const minReceived = calculateSlippageAmount(parsedOneCoinAmount, userSlippageTolerance)[0]

        console.log('call removeLiquidityOneCoin', lpAmountToBurn, selectedCoinIndex, minReceived)

        response = await removeLiquidityOneCoin(lpAmountToBurn, selectedCoinIndex === 0, minReceived)

        if (selectedCoinIndex === 0) {
          amountA = parsedOneCoinAmount.toSignificant(3)
          amountB = '0'
        } else {
          amountA = '0'
          amountB = parsedOneCoinAmount.toSignificant(3)
        }
      } else {
        // Custom mode
        if (customAmount0Parsed === 0n && customAmount1Parsed === 0n) return
        if (!customMaxBurnAmount || customMaxBurnAmount === 0n) return

        // Apply slippage to max burn amount (allow slightly more burn for slippage)
        const slippagePercent = new Percent(userSlippageTolerance, 10000)
        const maxBurnWithSlippage = customMaxBurnAmount + (customMaxBurnAmount * BigInt(userSlippageTolerance)) / 10000n

        response = await removeLiquidityImbalance(customAmount0Parsed, customAmount1Parsed, maxBurnWithSlippage)

        const parsedCustomAmount0 = CurrencyAmount.fromRawAmount(currencyA, customAmount0Parsed)
        const parsedCustomAmount1 = CurrencyAmount.fromRawAmount(currencyB, customAmount1Parsed)
        amountA = parsedCustomAmount0.toSignificant(3)
        amountB = parsedCustomAmount1.toSignificant(3)
      }

      setLiquidityState({ attemptingTxn: false, liquidityErrorMessage: undefined, txHash: response })

      addTransaction(
        { hash: response },
        {
          summary: `Remove ${amountA} ${symbolA} and ${amountB} ${symbolB}`,
          translatableSummary: {
            text: 'Remove %amountA% %symbolA% and %amountB% %symbolB%',
            data: { amountA, symbolA, amountB, symbolB },
          },
          type: 'remove-liquidity',
        },
      )
    } catch (error) {
      if (error && !isUserRejected(error)) {
        logError(error)
        console.error('Remove liquidity failed:', error)
      }
      setLiquidityState({
        attemptingTxn: false,
        liquidityErrorMessage:
          error && !isUserRejected(error)
            ? t('Remove liquidity failed: %message%', { message: transactionErrorToUserReadableMessage(error, t) })
            : undefined,
        txHash: undefined,
      })
    }
  }, [
    currencyA,
    currencyB,
    removeMode,
    lpAmountToBurn,
    parsedAmountA,
    parsedAmountB,
    oneCoinAmount,
    selectedCoinIndex,
    customAmount0Parsed,
    customAmount1Parsed,
    customMaxBurnAmount,
    estimateRemoveLiquidityGas,
    removeLiquidityInfinityStablePool,
    removeLiquidityOneCoin,
    removeLiquidityImbalance,
    userSlippageTolerance,
    addTransaction,
    t,
  ])

  const pendingText = t('Removing %amountA% %symbolA% and %amountB% %symbolB%', {
    amountA: parsedAmountA?.toSignificant(6) ?? '',
    symbolA: currencyA?.symbol ?? '',
    amountB: parsedAmountB?.toSignificant(6) ?? '',
    symbolB: currencyB?.symbol ?? '',
  })

  const handleDismissConfirmation = useCallback(() => {
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      setPercentToRemove(0)
    }

    setLiquidityState({
      attemptingTxn: false,
      liquidityErrorMessage: undefined,
      txHash: undefined,
    })
  }, [txHash])

  const liquidityPercentChangeCallback = useCallback((value: number) => {
    setPercentToRemove(value)
  }, [])

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    percentToRemove,
    liquidityPercentChangeCallback,
  )

  const handleChangePercent = useCallback(
    (value) => setInnerLiquidityPercentage(Math.ceil(value)),
    [setInnerLiquidityPercentage],
  )

  const parsedAmounts = useMemo(
    () => ({
      [Field.LIQUIDITY_PERCENT]: new Percent(percentToRemove, 100),
      CURRENCY_A: parsedAmountA,
      CURRENCY_B: parsedAmountB,
    }),
    [parsedAmountA, parsedAmountB, percentToRemove],
  )

  const [onPresentRemoveLiquidity] = useModal(
    currencyA?.wrapped && currencyB?.wrapped ? (
      <ConfirmLiquidityModal
        title={t('You will receive')}
        customOnDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txHash || ''}
        allowedSlippage={userSlippageTolerance}
        onRemove={onRemove}
        pendingText={pendingText}
        approval={approvalState}
        tokenA={currencyA.wrapped}
        tokenB={currencyB.wrapped}
        liquidityErrorMessage={liquidityErrorMessage}
        parsedAmounts={parsedAmounts}
        currencyA={currencyA ?? undefined}
        currencyB={currencyB ?? undefined}
      />
    ) : (
      <></>
    ),
    true,
    true,
    'removeLiquidityModal',
  )

  // Memoize the remove liquidity modal handler
  const handleOpenRemoveLiquidityModal = useCallback(() => {
    setLiquidityState({
      attemptingTxn: false,
      liquidityErrorMessage: undefined,
      txHash: undefined,
    })
    onPresentRemoveLiquidity()
  }, [onPresentRemoveLiquidity])

  // Calculate percentage of each token in the withdrawal
  const [percentageA, percentageB] = useMemo(() => {
    if (!amount0Withdrawn || !amount1Withdrawn || (amount0Withdrawn === 0n && amount1Withdrawn === 0n)) {
      return ['50', '50']
    }
    const total = amount0Withdrawn + amount1Withdrawn
    if (total === 0n) return ['50', '50']
    const percA = (amount0Withdrawn * 10000n) / total / 100n
    const percB = (amount1Withdrawn * 10000n) / total / 100n
    return [percA.toString(), percB.toString()]
  }, [amount0Withdrawn, amount1Withdrawn])

  // Calculate current token balances from user's LP position
  const [currentAmount0, currentAmount1] = useMemo<[bigint, bigint]>(() => {
    if (!totalSupply || totalSupply === 0n || !balance0 || !balance1 || !userLPBalance) {
      return [0n, 0n]
    }
    const amount0 = (userLPBalance * balance0) / totalSupply
    const amount1 = (userLPBalance * balance1) / totalSupply
    return [amount0, amount1]
  }, [userLPBalance, balance0, balance1, totalSupply])

  const isValid = useMemo(() => {
    if (!isReady) return false

    if (removeMode === RemoveMode.BALANCE) {
      return lpAmountToBurn > 0n && !calcError
    }
    if (removeMode === RemoveMode.ONE_COIN) {
      return lpAmountToBurn > 0n && oneCoinAmount > 0n
    }
    if (removeMode === RemoveMode.CUSTOM) {
      // Check if amounts are positive
      const hasAmount = customAmount0Parsed > 0n || customAmount1Parsed > 0n
      // Check if amounts don't exceed current balance
      const amount0Valid = customAmount0Parsed === 0n || customAmount0Parsed <= currentAmount0
      const amount1Valid = customAmount1Parsed === 0n || customAmount1Parsed <= currentAmount1
      // Check if we have a valid burn amount
      const hasValidBurnAmount =
        customMaxBurnAmount !== undefined && customMaxBurnAmount !== null && customMaxBurnAmount > 0n

      return hasAmount && amount0Valid && amount1Valid && hasValidBurnAmount
    }
    return false
  }, [
    removeMode,
    lpAmountToBurn,
    calcError,
    oneCoinAmount,
    customAmount0Parsed,
    customAmount1Parsed,
    customMaxBurnAmount,
    isReady,
    currentAmount0,
    currentAmount1,
  ])

  const insufficientBalanceError = useMemo(() => {
    if (removeMode !== RemoveMode.CUSTOM) return null

    const insufficientTokens: string[] = []

    if (customAmount0Parsed > 0n && customAmount0Parsed > currentAmount0 && currencyA) {
      insufficientTokens.push(currencyA.symbol || 'Token')
    }
    if (customAmount1Parsed > 0n && customAmount1Parsed > currentAmount1 && currencyB) {
      insufficientTokens.push(currencyB.symbol || 'Token')
    }

    return insufficientTokens.length > 0 ? insufficientTokens.join(' and ') : null
  }, [removeMode, customAmount0Parsed, customAmount1Parsed, currentAmount0, currentAmount1, currencyA, currencyB])

  // Calculate new balances after removal based on mode
  const [newAmount0, newAmount1] = useMemo<[bigint, bigint]>(() => {
    // Helper function to handle very small values (likely rounding errors)
    const cleanupSmallValue = (value: bigint): bigint => {
      // If value is negative or less than 100 wei, treat as 0
      if (value < 0n || value < 100n) return 0n
      return value
    }

    if (removeMode === RemoveMode.BALANCE) {
      return [
        cleanupSmallValue(currentAmount0 - amount0Withdrawn),
        cleanupSmallValue(currentAmount1 - amount1Withdrawn),
      ]
    }
    if (removeMode === RemoveMode.ONE_COIN) {
      if (selectedCoinIndex === 0) {
        return [cleanupSmallValue(currentAmount0 - oneCoinAmount), currentAmount1]
      }
      return [currentAmount0, cleanupSmallValue(currentAmount1 - oneCoinAmount)]
    }
    if (removeMode === RemoveMode.CUSTOM) {
      return [
        cleanupSmallValue(currentAmount0 - customAmount0Parsed),
        cleanupSmallValue(currentAmount1 - customAmount1Parsed),
      ]
    }
    return [currentAmount0, currentAmount1]
  }, [
    removeMode,
    currentAmount0,
    currentAmount1,
    amount0Withdrawn,
    amount1Withdrawn,
    selectedCoinIndex,
    oneCoinAmount,
    customAmount0Parsed,
    customAmount1Parsed,
  ])

  // Parse current and new amounts for display
  const currentParsedAmountA = useMemo(() => {
    if (!currencyA || currentAmount0 === 0n) return undefined
    return CurrencyAmount.fromRawAmount(currencyA, currentAmount0)
  }, [currencyA, currentAmount0])

  const currentParsedAmountB = useMemo(() => {
    if (!currencyB || currentAmount1 === 0n) return undefined
    return CurrencyAmount.fromRawAmount(currencyB, currentAmount1)
  }, [currencyB, currentAmount1])

  const newParsedAmountA = useMemo(() => {
    if (!currencyA) return undefined
    return CurrencyAmount.fromRawAmount(currencyA, newAmount0)
  }, [currencyA, newAmount0])

  const newParsedAmountB = useMemo(() => {
    if (!currencyB) return undefined
    return CurrencyAmount.fromRawAmount(currencyB, newAmount1)
  }, [currencyB, newAmount1])

  // Calculate USD values for current, new, and removed amounts
  const currentTotalUSD = useTotalPriceUSD({
    currency0: currencyA,
    currency1: currencyB,
    amount0: currentParsedAmountA,
    amount1: currentParsedAmountB,
  })

  // Calculate removed amounts based on mode for USD calculation
  const [removedAmount0, removedAmount1] = useMemo(() => {
    if (removeMode === RemoveMode.BALANCE) {
      return [parsedAmountA, parsedAmountB]
    }
    if (removeMode === RemoveMode.ONE_COIN) {
      if (selectedCoinIndex === 0 && currencyA && oneCoinAmount > 0n) {
        return [CurrencyAmount.fromRawAmount(currencyA, oneCoinAmount), undefined]
      }
      if (selectedCoinIndex === 1 && currencyB && oneCoinAmount > 0n) {
        return [undefined, CurrencyAmount.fromRawAmount(currencyB, oneCoinAmount)]
      }
    }
    if (removeMode === RemoveMode.CUSTOM) {
      const amt0 =
        currencyA && customAmount0Parsed > 0n ? CurrencyAmount.fromRawAmount(currencyA, customAmount0Parsed) : undefined
      const amt1 =
        currencyB && customAmount1Parsed > 0n ? CurrencyAmount.fromRawAmount(currencyB, customAmount1Parsed) : undefined
      return [amt0, amt1]
    }
    return [undefined, undefined]
  }, [
    removeMode,
    parsedAmountA,
    parsedAmountB,
    selectedCoinIndex,
    currencyA,
    currencyB,
    oneCoinAmount,
    customAmount0Parsed,
    customAmount1Parsed,
  ])

  const removedTotalUSD = useTotalPriceUSD({
    currency0: currencyA,
    currency1: currencyB,
    amount0: removedAmount0,
    amount1: removedAmount1,
  })

  const newTotalUSD = currentTotalUSD - removedTotalUSD

  return (
    <Box mx="auto" pb="16px" width="100%" maxWidth={[null, null, null, null, '480px']}>
      <Card>
        <CardBody>
          <AutoColumn>
            <AutoColumn gap="20px">
              <RowBetween>
                <Text>{t('Amount')}</Text>
              </RowBetween>
              <BorderCard style={{ padding: isMobile ? '8px' : '16px' }}>
                <Text fontSize="40px" bold mb="16px" style={{ lineHeight: 1 }}>
                  {percentToRemove}%
                </Text>
                <Slider
                  name="lp-amount"
                  min={0}
                  max={100}
                  value={innerLiquidityPercentage}
                  onValueChanged={handleChangePercent}
                  mb="16px"
                />
                <Flex flexWrap="wrap" justifyContent="space-evenly">
                  <Button variant="tertiary" scale="sm" onClick={() => setPercentToRemove(25)}>
                    25%
                  </Button>
                  <Button variant="tertiary" scale="sm" onClick={() => setPercentToRemove(50)}>
                    50%
                  </Button>
                  <Button variant="tertiary" scale="sm" onClick={() => setPercentToRemove(75)}>
                    75%
                  </Button>
                  <Button variant="tertiary" scale="sm" onClick={() => setPercentToRemove(100)}>
                    {t('Max.fill-max')}
                  </Button>
                </Flex>
              </BorderCard>
            </AutoColumn>
            {/* collect as */}
            <>
              <ColumnCenter>
                <ArrowDownIcon color="textSubtle" width="24px" my="16px" />
              </ColumnCenter>
              <AutoColumn gap="12px">
                <Text bold color="secondary" fontSize="12px" textTransform="uppercase">
                  {t('Collect as')}
                </Text>
                <LightGreyCard>
                  {/* Radio Group */}
                  <AutoRow gap="16px" mb="16px">
                    <CardCheckBox
                      label={t('One coin')}
                      checked={removeMode === RemoveMode.ONE_COIN}
                      onChange={() => setRemoveMode(RemoveMode.ONE_COIN)}
                    />
                    <CardCheckBox
                      label={t('Balance')}
                      checked={removeMode === RemoveMode.BALANCE}
                      onChange={() => setRemoveMode(RemoveMode.BALANCE)}
                    />
                    <CardCheckBox
                      label={t('Custom')}
                      checked={removeMode === RemoveMode.CUSTOM}
                      onChange={() => setRemoveMode(RemoveMode.CUSTOM)}
                    />
                  </AutoRow>

                  {/* Balance Mode Display */}
                  {removeMode === RemoveMode.BALANCE && (
                    <AutoColumn gap="8px">
                      <BorderCard style={{ padding: '8px 16px' }}>
                        <Flex justifyContent="space-between" alignItems="center">
                          <Flex alignItems="center" style={{ gap: '8px' }}>
                            <CurrencyLogo showChainLogo currency={currencyA ?? undefined} size="40px" />
                            <Flex flexDirection="column" style={{ gap: '4px' }}>
                              <Text fontSize="16px" bold>
                                {currencyA?.symbol}
                              </Text>
                            </Flex>
                          </Flex>
                          <Flex flexDirection="column" alignItems="flex-end" style={{ gap: '4px' }}>
                            <Text fontSize="16px" bold>
                              {parsedAmountA?.toSignificant(6) || '0'}
                            </Text>
                            <Text fontSize="12px" color="textSubtle">
                              ~
                              {formatDollarAmount(
                                (parsedAmountA ? parseFloat(parsedAmountA.toSignificant(6)) : 0) * 1,
                                2,
                                true,
                              )}
                            </Text>
                          </Flex>
                        </Flex>
                      </BorderCard>
                      <BorderCard style={{ padding: '8px 16px' }}>
                        <Flex justifyContent="space-between" alignItems="center">
                          <Flex alignItems="center" style={{ gap: '8px' }}>
                            <CurrencyLogo showChainLogo currency={currencyB ?? undefined} size="40px" />
                            <Flex flexDirection="column" style={{ gap: '4px' }}>
                              <Text fontSize="16px" bold>
                                {currencyB?.symbol}
                              </Text>
                            </Flex>
                          </Flex>
                          <Flex flexDirection="column" alignItems="flex-end" style={{ gap: '4px' }}>
                            <Text fontSize="16px" bold>
                              {parsedAmountB?.toSignificant(6) || '0'}
                            </Text>
                            <Text fontSize="12px" color="textSubtle">
                              ~
                              {formatDollarAmount(
                                (parsedAmountB ? parseFloat(parsedAmountB.toSignificant(6)) : 0) * 1,
                                2,
                                true,
                              )}
                            </Text>
                          </Flex>
                        </Flex>
                      </BorderCard>
                    </AutoColumn>
                  )}

                  {/* OneCoin Mode Display */}
                  {removeMode === RemoveMode.ONE_COIN && (
                    <AutoColumn gap="8px">
                      <BorderCard
                        style={{
                          padding: '8px 16px',
                          cursor: 'pointer',
                          border: selectedCoinIndex === 0 ? '1px solid #31D0AA' : undefined,
                        }}
                        onClick={() => setSelectedCoinIndex(0)}
                      >
                        <Flex justifyContent="space-between" alignItems="center">
                          <Flex alignItems="center" style={{ gap: '8px', marginLeft: '-8px' }}>
                            <CardCheckBox
                              label=""
                              checked={selectedCoinIndex === 0}
                              onChange={() => setSelectedCoinIndex(0)}
                            />
                            <CurrencyLogo showChainLogo currency={currencyA ?? undefined} size="40px" />
                            <Flex flexDirection="column" style={{ gap: '4px' }}>
                              <Text fontSize="16px" bold>
                                {currencyA?.symbol}
                              </Text>
                            </Flex>
                          </Flex>
                          <Flex flexDirection="column" alignItems="flex-end" style={{ gap: '4px' }}>
                            <Text fontSize="16px" bold>
                              {selectedCoinIndex === 0 && oneCoinAmount > 0n
                                ? CurrencyAmount.fromRawAmount(currencyA!, oneCoinAmount).toSignificant(6)
                                : '0'}
                            </Text>
                            <Text fontSize="12px" color="textSubtle">
                              ~
                              {selectedCoinIndex === 0 && oneCoinAmount > 0n
                                ? formatDollarAmount(
                                    parseFloat(
                                      CurrencyAmount.fromRawAmount(currencyA!, oneCoinAmount).toSignificant(6),
                                    ) * 1,
                                    2,
                                    true,
                                  )
                                : '$0.00'}
                            </Text>
                          </Flex>
                        </Flex>
                      </BorderCard>
                      <BorderCard
                        style={{
                          padding: '8px 16px',
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedCoinIndex(1)}
                      >
                        <Flex justifyContent="space-between" alignItems="center">
                          <Flex alignItems="center" style={{ gap: '8px', marginLeft: '-8px' }}>
                            <CardCheckBox
                              label=""
                              checked={selectedCoinIndex === 1}
                              onChange={() => setSelectedCoinIndex(1)}
                            />
                            <CurrencyLogo showChainLogo currency={currencyB ?? undefined} size="40px" />
                            <Flex flexDirection="column" style={{ gap: '4px' }}>
                              <Text fontSize="16px" bold>
                                {currencyB?.symbol}
                              </Text>
                            </Flex>
                          </Flex>
                          <Flex flexDirection="column" alignItems="flex-end" style={{ gap: '4px' }}>
                            <Text fontSize="16px" bold>
                              {selectedCoinIndex === 1 && oneCoinAmount > 0n
                                ? CurrencyAmount.fromRawAmount(currencyB!, oneCoinAmount).toSignificant(6)
                                : '0'}
                            </Text>
                            <Text fontSize="12px" color="textSubtle">
                              ~
                              {selectedCoinIndex === 1 && oneCoinAmount > 0n
                                ? formatDollarAmount(
                                    parseFloat(
                                      CurrencyAmount.fromRawAmount(currencyB!, oneCoinAmount).toSignificant(6),
                                    ) * 1,
                                    2,
                                    true,
                                  )
                                : '$0.00'}
                            </Text>
                          </Flex>
                        </Flex>
                      </BorderCard>
                    </AutoColumn>
                  )}

                  {/* Custom Mode Display */}
                  {removeMode === RemoveMode.CUSTOM && (
                    <AutoColumn gap="8px">
                      <CurrencyInputPanelSimplify
                        title={<>&nbsp;</>}
                        id="remove-liquidity-custom-currency-0"
                        defaultValue={customAmount0}
                        onUserInput={setCustomAmount0}
                        currency={currencyA ?? undefined}
                        overrideBalance={currentParsedAmountA}
                        showMaxButton
                        onMax={() => setCustomAmount0(currentParsedAmountA?.toExact() ?? '')}
                        showUSDPrice
                        disableCurrencySelect
                      />
                      <CurrencyInputPanelSimplify
                        title={<>&nbsp;</>}
                        id="remove-liquidity-custom-currency-1"
                        defaultValue={customAmount1}
                        onUserInput={setCustomAmount1}
                        currency={currencyB ?? undefined}
                        overrideBalance={currentParsedAmountB}
                        showMaxButton
                        onMax={() => setCustomAmount1(currentParsedAmountB?.toExact() ?? '')}
                        showUSDPrice
                        disableCurrencySelect
                      />
                    </AutoColumn>
                  )}
                </LightGreyCard>
              </AutoColumn>
            </>

            <RowBetween mt="16px">
              <Text bold color="secondary" fontSize="12px">
                {t('Slippage Tolerance')}
              </Text>
              <LiquiditySlippageButton />
            </RowBetween>

            {/* Position Summary */}
            {percentToRemove > 0 && (
              <BorderCard style={{ marginTop: '16px' }}>
                <AutoColumn gap="12px">
                  {/* Header */}
                  <RowBetween mb="8px">
                    <Text bold color="secondary" fontSize="12px" textTransform="uppercase">
                      {t('Position')}
                    </Text>
                    <Flex alignItems="center" style={{ gap: '8px' }}>
                      <Text fontSize="12px" color="textSubtle">
                        {t('Current')}
                      </Text>
                      <ArrowForwardIcon width="12px" color="textSubtle" />
                      <Text fontSize="12px" color="textSubtle">
                        {t('New Balance')}
                      </Text>
                    </Flex>
                  </RowBetween>

                  {/* Token 1 Row */}
                  <RowBetween>
                    <Flex alignItems="center" style={{ gap: '8px' }}>
                      <CurrencyLogo currency={currencyA ?? undefined} size="24px" />
                      <Text>{currencyA?.symbol}</Text>
                    </Flex>
                    <Flex alignItems="center" style={{ gap: '8px' }}>
                      <Text>{currentParsedAmountA?.toSignificant(6) || '0'}</Text>
                      <ArrowForwardIcon width="12px" color="textSubtle" />
                      <Text>{newParsedAmountA?.toSignificant(6) || '0'}</Text>
                    </Flex>
                  </RowBetween>

                  {/* Token 2 Row */}
                  <RowBetween>
                    <Flex alignItems="center" style={{ gap: '8px' }}>
                      <CurrencyLogo currency={currencyB ?? undefined} size="24px" />
                      <Text>{currencyB?.symbol}</Text>
                    </Flex>
                    <Flex alignItems="center" style={{ gap: '8px' }}>
                      <Text>{currentParsedAmountB?.toSignificant(6) || '0'}</Text>
                      <ArrowForwardIcon width="12px" color="textSubtle" />
                      <Text>{newParsedAmountB?.toSignificant(6) || '0'}</Text>
                    </Flex>
                  </RowBetween>

                  {/* Divider */}
                  <Box height="1px" backgroundColor="cardBorder" my="4px" />

                  {/* Total Position Value (USD) */}
                  <RowBetween>
                    <PreTitle textTransform="uppercase">{t('Total Position Value (USD)')}</PreTitle>
                    <Flex alignItems="center" style={{ gap: '8px' }}>
                      <Text>{formatDollarAmount(currentTotalUSD, 2, false)}</Text>
                      <ArrowForwardIcon width="12px" color="textSubtle" />
                      <Text>{formatDollarAmount(newTotalUSD, 2, false)}</Text>
                    </Flex>
                  </RowBetween>

                  {/* Total removed value (USD) */}
                  <RowBetween>
                    <Text color="textSubtle">{t('Total removed value (USD)')}</Text>
                    <Text>{formatDollarAmount(removedTotalUSD, 2, false)}</Text>
                  </RowBetween>
                </AutoColumn>
              </BorderCard>
            )}

            <Box position="relative" mt="16px">
              {!account ? (
                <ConnectWalletButton width="100%" />
              ) : isWrongNetwork ? (
                <CommitButton width="100%" />
              ) : (
                <RowBetween>
                  <Button
                    variant={!isValid && lpAmountToBurn > 0n ? 'danger' : 'primary'}
                    onClick={handleOpenRemoveLiquidityModal}
                    width="100%"
                    disabled={!isValid || approvalState !== ApprovalState.APPROVED}
                  >
                    {!isReady
                      ? t('Pool not ready')
                      : lpAmountToBurn === 0n && removeMode !== RemoveMode.CUSTOM
                      ? t('Enter an amount')
                      : removeMode === RemoveMode.CUSTOM && customAmount0Parsed === 0n && customAmount1Parsed === 0n
                      ? t('Enter an amount')
                      : insufficientBalanceError
                      ? t('Insufficient %symbol% balance', { symbol: insufficientBalanceError })
                      : calcError
                      ? t('Error calculating amounts')
                      : t('Remove')}
                  </Button>
                </RowBetween>
              )}
            </Box>
          </AutoColumn>
        </CardBody>
      </Card>
    </Box>
  )
}
