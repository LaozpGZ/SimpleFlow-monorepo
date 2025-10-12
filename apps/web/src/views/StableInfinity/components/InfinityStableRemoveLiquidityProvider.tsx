import { useState, useCallback, useMemo, useEffect } from 'react'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { CurrencyAmount, Percent, Token } from '@pancakeswap/swap-sdk-core'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { useTranslation } from '@pancakeswap/localization'
import {
  useModal,
  ArrowDownIcon,
  AutoColumn,
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
} from '@pancakeswap/uikit'
import { useTransactionAdder } from 'state/transactions/hooks'
import { isUserRejected, logError } from 'utils/sentry'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import ConfirmLiquidityModal from 'views/Swap/components/ConfirmRemoveLiquidityModal'
import { Field } from 'state/burn/actions'
import { LightGreyCard } from 'components/Card'
import { CurrencyLogo } from 'components/Logo'
import { RowBetween } from 'components/Layout/Row'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Dots from 'components/Loader/Dots'
import { CommitButton } from 'components/CommitButton'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { LiquiditySlippageButton } from 'views/Swap/components/SlippageButton'
import { styled } from 'styled-components'
import { useDebouncedChangeHandler } from '@pancakeswap/hooks'
import { useTotalPriceUSD } from 'hooks/useTotalPriceUSD'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { calculateSlippageAmount } from 'utils/exchange'
import { useRemoveLiquidityInfinityStablePool } from '../hooks/useRemoveLiquidityInfinityStablePool'
import { useCalcTokenAmount, useUserLPBalance, useTotalSupply, usePoolBalances } from '../hooks/useCalcTokenAmount'

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

  const { estimateRemoveLiquidityGas, removeLiquidityInfinityStablePool, isReady } =
    useRemoveLiquidityInfinityStablePool({ poolAddress })

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
    if (!currencyA || !currencyB || !lpAmountToBurn || lpAmountToBurn === 0n) return

    // reuse slippage calc
    const minAmount0 = parsedAmountA ? calculateSlippageAmount(parsedAmountA, userSlippageTolerance)[0] : 0n
    const minAmount1 = parsedAmountB ? calculateSlippageAmount(parsedAmountB, userSlippageTolerance)[0] : 0n

    setLiquidityState({ attemptingTxn: true, liquidityErrorMessage: undefined, txHash: undefined })

    try {
      const response = await removeLiquidityInfinityStablePool(lpAmountToBurn, minAmount0, minAmount1)

      setLiquidityState({ attemptingTxn: false, liquidityErrorMessage: undefined, txHash: response })

      const symbolA = currencyA?.symbol
      const amountA = parsedAmountA?.toSignificant(3) || '0'
      const symbolB = currencyB?.symbol
      const amountB = parsedAmountB?.toSignificant(3) || '0'

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
    lpAmountToBurn,
    parsedAmountA,
    parsedAmountB,
    estimateRemoveLiquidityGas,
    removeLiquidityInfinityStablePool,
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

  const isValid = lpAmountToBurn > 0n && !calcError && isReady

  // Calculate current token balances from user's LP position
  const [currentAmount0, currentAmount1] = useMemo<[bigint, bigint]>(() => {
    if (!totalSupply || totalSupply === 0n || !balance0 || !balance1 || !userLPBalance) {
      return [0n, 0n]
    }
    const amount0 = (userLPBalance * balance0) / totalSupply
    const amount1 = (userLPBalance * balance1) / totalSupply
    return [amount0, amount1]
  }, [userLPBalance, balance0, balance1, totalSupply])

  // Calculate new balances after removal
  const [newAmount0, newAmount1] = useMemo<[bigint, bigint]>(() => {
    return [currentAmount0 - amount0Withdrawn, currentAmount1 - amount1Withdrawn]
  }, [currentAmount0, currentAmount1, amount0Withdrawn, amount1Withdrawn])

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

  const removedTotalUSD = useTotalPriceUSD({
    currency0: currencyA,
    currency1: currencyB,
    amount0: parsedAmountA,
    amount1: parsedAmountB,
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
            <>
              <ColumnCenter>
                <ArrowDownIcon color="textSubtle" width="24px" my="16px" />
              </ColumnCenter>
              <AutoColumn gap="12px">
                <Text bold color="secondary" fontSize="12px" textTransform="uppercase">
                  {t('Receive')}
                </Text>
                <LightGreyCard>
                  <Flex justifyContent="space-between" mb="8px" as="label" alignItems="center">
                    <Flex alignItems="center">
                      <CurrencyLogo currency={currencyA ?? undefined} />
                      <Text small color="textSubtle" id="remove-liquidity-tokena-symbol" ml="4px">
                        {currencyA?.symbol}
                      </Text>
                    </Flex>
                    <Flex>
                      <Text small bold>
                        {parsedAmountA?.toSignificant(6) || '0'}
                      </Text>
                      <Text small ml="4px">
                        {percentageA}%
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex justifyContent="space-between" as="label" alignItems="center">
                    <Flex alignItems="center">
                      <CurrencyLogo currency={currencyB ?? undefined} />
                      <Text small color="textSubtle" id="remove-liquidity-tokenb-symbol" ml="4px">
                        {currencyB?.symbol}
                      </Text>
                    </Flex>
                    <Flex>
                      <Text bold small>
                        {parsedAmountB?.toSignificant(6) || '0'}
                      </Text>
                      <Text small ml="4px">
                        {percentageB}%
                      </Text>
                    </Flex>
                  </Flex>
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
                      : lpAmountToBurn === 0n
                      ? t('Enter an amount')
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
