import { PoolKey } from '@pancakeswap/infinity-sdk'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { CurrencyAmount, Percent, Token } from '@pancakeswap/swap-sdk-core'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { useAccount } from 'wagmi'
import { useTranslation } from '@pancakeswap/localization'
import {
  useModal,
  AddIcon,
  ArrowDownIcon,
  AutoColumn,
  Box,
  Button,
  CardBody,
  ColumnCenter,
  Flex,
  Slider,
  Text,
  TooltipText,
  useMatchBreakpoints,
  useTooltip,
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
import { formatAmount } from 'utils/formatInfoNumbers'
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

  const { removeLiquidityInfinityStablePool, isReady } = useRemoveLiquidityInfinityStablePool({ poolAddress })

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

  // Approval hook for LP tokens
  const { approvalState, approveCallback } = useApproveCallback(lpTokenAmount, poolAddress)

  const onRemove = useCallback(async () => {
    if (!currencyA || !currencyB || !lpAmountToBurn || lpAmountToBurn === 0n) return

    // Calculate minimum amounts using user's slippage tolerance
    const slippagePercent = BigInt(userSlippageTolerance)
    const minAmount0 = parsedAmountA ? (parsedAmountA.quotient * (10000n - slippagePercent)) / 10000n : 0n
    const minAmount1 = parsedAmountB ? (parsedAmountB.quotient * (10000n - slippagePercent)) / 10000n : 0n

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

  // Calculate token prices (for stable pools, typically 1:1 ratio)
  const priceOfTokenAInTokenB = useMemo(() => {
    if (!parsedAmountA || !parsedAmountB || parsedAmountA.equalTo(0)) return undefined
    return parsedAmountB.divide(parsedAmountA).toSignificant(6)
  }, [parsedAmountA, parsedAmountB])

  const priceOfTokenBInTokenA = useMemo(() => {
    if (!parsedAmountA || !parsedAmountB || parsedAmountB.equalTo(0)) return undefined
    return parsedAmountA.divide(parsedAmountB).toSignificant(6)
  }, [parsedAmountA, parsedAmountB])

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

  return (
    <>
      <CardBody>
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

        {currencyA && currencyB && parsedAmountA && parsedAmountB && (
          <AutoColumn gap="12px" style={{ marginTop: '16px' }}>
            <Text bold color="secondary" fontSize="12px" textTransform="uppercase">
              {t('Prices')}
            </Text>
            <LightGreyCard>
              <Flex justifyContent="space-between">
                <Text small color="textSubtle">
                  1 {currencyA?.symbol} =
                </Text>
                <Text small>
                  {priceOfTokenAInTokenB || '-'} {currencyB?.symbol}
                </Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text small color="textSubtle">
                  1 {currencyB?.symbol} =
                </Text>
                <Text small>
                  {priceOfTokenBInTokenA || '-'} {currencyA?.symbol}
                </Text>
              </Flex>
            </LightGreyCard>
          </AutoColumn>
        )}

        <RowBetween mt="16px">
          <Text bold color="secondary" fontSize="12px">
            {t('Slippage Tolerance')}
          </Text>
          <LiquiditySlippageButton />
        </RowBetween>

        <Box position="relative" mt="16px">
          {!account ? (
            <ConnectWalletButton width="100%" />
          ) : isWrongNetwork ? (
            <CommitButton width="100%" />
          ) : (
            <RowBetween>
              <Button
                variant={approvalState === ApprovalState.APPROVED ? 'success' : 'primary'}
                onClick={() => approveCallback()}
                disabled={approvalState !== ApprovalState.NOT_APPROVED}
                width="100%"
                mr="0.5rem"
              >
                {approvalState === ApprovalState.PENDING ? (
                  <Dots>{t('Enabling')}</Dots>
                ) : approvalState === ApprovalState.APPROVED ? (
                  t('Enabled')
                ) : (
                  t('Enable.Approval')
                )}
              </Button>
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
      </CardBody>
    </>
  )
}
