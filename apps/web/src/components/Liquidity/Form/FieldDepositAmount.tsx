import { useTranslation } from '@pancakeswap/localization'
import { Currency, Percent } from '@pancakeswap/swap-sdk-core'
import { AutoColumn, Box, BoxProps, PreTitle } from '@pancakeswap/uikit'
import CurrencyInputPanelSimplify from 'components/CurrencyInputPanelSimplify'
import { useMaxAmount } from 'hooks/useMaxAmount'
import { useCallback, useMemo } from 'react'
import { useInverted } from 'state/infinity/shared'

type FieldDepositAmountProps = BoxProps & {
  chainId: number | undefined
  baseCurrency: Currency | undefined
  quoteCurrency: Currency | undefined
  handleDepositAmountChange: (amount: string, index: 0 | 1) => void
  inputValue0: string | undefined
  inputValue1: string | undefined
  isDepositEnabled: boolean
  isDeposit0Enabled: boolean
  isDeposit1Enabled: boolean
  addOnly?: boolean
}

export const FieldDepositAmount: React.FC<FieldDepositAmountProps> = ({
  chainId,
  baseCurrency,
  quoteCurrency,
  handleDepositAmountChange,
  inputValue0,
  inputValue1,
  addOnly,
  isDepositEnabled,
  isDeposit0Enabled,
  isDeposit1Enabled,
  ...boxProps
}) => {
  const { t } = useTranslation()
  const [inverted] = useInverted()
  const maxAmountBase = useMaxAmount(baseCurrency)
  const maxAmountQuote = useMaxAmount(quoteCurrency)

  const handleUserInputBaseCurrency = useCallback(
    (amount: string) => {
      handleDepositAmountChange(amount, inverted ? 1 : 0)
    },
    [inverted, handleDepositAmountChange],
  )

  const handleUserInputQuoteCurrency = useCallback(
    (amount: string) => {
      handleDepositAmountChange(amount, inverted ? 0 : 1)
    },
    [inverted, handleDepositAmountChange],
  )

  const [isDepositBaseEnabled, isDepositQuoteEnabled] = useMemo(() => {
    return inverted ? [isDeposit1Enabled, isDeposit0Enabled] : [isDeposit0Enabled, isDeposit1Enabled]
  }, [inverted, isDeposit0Enabled, isDeposit1Enabled])
  const [inputValueBase, inputValueQuote] = useMemo(() => {
    return inverted ? [inputValue1, inputValue0] : [inputValue0, inputValue1]
  }, [inverted, inputValue0, inputValue1])

  const isDepositBaseDisabled = !isDepositEnabled || !isDepositBaseEnabled
  const isDepositQuoteDisabled = !isDepositEnabled || !isDepositQuoteEnabled

  const handleInputPercentInput = useCallback(
    (percent: number) => {
      handleUserInputBaseCurrency(maxAmountBase?.multiply(new Percent(percent, 100))?.toExact() ?? '')
    },
    [maxAmountBase, handleUserInputBaseCurrency],
  )

  const handleOutputPercentInput = useCallback(
    (percent: number) => {
      handleUserInputQuoteCurrency(maxAmountQuote?.multiply(new Percent(percent, 100))?.toExact() ?? '')
    },
    [maxAmountQuote, handleUserInputQuoteCurrency],
  )

  const handleInputMaxClick = useCallback(
    () => (isDepositBaseDisabled ? undefined : handleUserInputBaseCurrency(maxAmountBase?.toExact() ?? '')),
    [isDepositBaseDisabled, maxAmountBase, handleUserInputBaseCurrency],
  )

  const handleOutputMaxClick = useCallback(
    () => (isDepositBaseDisabled ? undefined : handleUserInputBaseCurrency(maxAmountBase?.toExact() ?? '')),
    [isDepositQuoteDisabled, maxAmountQuote, handleUserInputQuoteCurrency],
  )

  return (
    <Box {...boxProps}>
      <AutoColumn gap="8px">
        <CurrencyInputPanelSimplify
          id="infinity-add-liquidity-input-base-currency"
          title={<PreTitle>{t('Deposit Amount')}</PreTitle>}
          onUserInput={handleUserInputBaseCurrency}
          showMaxButton
          defaultValue={
            isDepositEnabled
              ? isDepositBaseEnabled
                ? inputValueBase ?? ''
                : addOnly
                ? t('The price range is outside current pool price')
                : t('The starting price is outside the specified price range')
              : addOnly
              ? t('Set price range first')
              : t('Set starting price and price range first')
          }
          onPercentInput={handleInputPercentInput}
          currency={baseCurrency}
          showUSDPrice
          showQuickInputButton
          disabled={isDepositBaseDisabled}
          showCommonBases
          showSearchInput
          disableCurrencySelect
          maxAmount={maxAmountBase}
          onMax={handleInputMaxClick}
        />
        <CurrencyInputPanelSimplify
          id="infinity-add-liquidity-input-quote-currency"
          title={<>&nbsp;</>}
          onUserInput={handleUserInputQuoteCurrency}
          showMaxButton
          defaultValue={
            isDepositEnabled
              ? isDepositQuoteEnabled
                ? inputValueQuote ?? ''
                : addOnly
                ? t('The price range is outside current pool price')
                : t('The starting price is outside the specified price range')
              : addOnly
              ? t('Set price range first')
              : t('Set starting price and price range first')
          }
          onPercentInput={handleOutputPercentInput}
          currency={quoteCurrency}
          showUSDPrice
          showQuickInputButton
          disabled={isDepositQuoteDisabled}
          showCommonBases
          showSearchInput
          maxAmount={maxAmountQuote}
          onMax={handleOutputMaxClick}
          disableCurrencySelect
        />
      </AutoColumn>
    </Box>
  )
}
