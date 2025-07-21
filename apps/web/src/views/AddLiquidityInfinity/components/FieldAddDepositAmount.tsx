import { useMemo } from 'react'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { BoxProps, RowBetween, Column, Text } from '@pancakeswap/uikit'
import { FieldDepositAmount } from 'components/Liquidity/Form/FieldDepositAmount'
import { useInfinityPoolIdRouteParams } from 'hooks/dynamicRoute/usePoolIdRoute'
import { useInverted } from 'state/infinity/shared'
import { SlippageButton } from 'views/Swap/components/SlippageButton'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { useAddDepositAmounts, useAddDepositAmountsEnabled } from '../hooks/useAddDepositAmounts'

type FieldDepositAmountProps = BoxProps & {
  baseCurrency: Currency | undefined
  quoteCurrency: Currency | undefined
}

export const FieldAddDepositAmount: React.FC<FieldDepositAmountProps> = ({
  baseCurrency,
  quoteCurrency,
  ...boxProps
}) => {
  const { chainId } = useInfinityPoolIdRouteParams()
  const { inputValue0, inputValue1, handleDepositAmountChange } = useAddDepositAmounts()
  const { isDepositEnabled, isDeposit0Enabled, isDeposit1Enabled } = useAddDepositAmountsEnabled()
  const [inverted] = useInverted()

  const { data: currency0Price } = useCurrencyUsdPrice(baseCurrency)
  const { data: currency1Price } = useCurrencyUsdPrice(quoteCurrency)

  const input0 = useMemo(() => (inverted ? inputValue1 : inputValue0), [inverted, inputValue0, inputValue1])
  const input1 = useMemo(() => (inverted ? inputValue0 : inputValue1), [inverted, inputValue0, inputValue1])

  const totalUsdValue = useMemo(() => {
    return (currency0Price ?? 0) * Number(input0 ?? 0) + (currency1Price ?? 0) * Number(input1 ?? 0)
  }, [currency0Price, currency1Price, input0, input1])

  return (
    <>
      <FieldDepositAmount
        {...boxProps}
        addOnly
        chainId={chainId}
        baseCurrency={baseCurrency}
        quoteCurrency={quoteCurrency}
        handleDepositAmountChange={handleDepositAmountChange}
        inputValue0={inputValue0}
        inputValue1={inputValue1}
        isDeposit0Enabled={isDeposit0Enabled}
        isDepositEnabled={isDepositEnabled}
        isDeposit1Enabled={isDeposit1Enabled}
      />
      <Column mt="16px" gap="16px">
        <RowBetween>
          <Text color="textSubtle">Total</Text>
          <Text>~${totalUsdValue.toFixed(2)}</Text>
        </RowBetween>
        <RowBetween>
          <Text color="textSubtle">Slippage Tolerance</Text>
          <SlippageButton />
        </RowBetween>
      </Column>
    </>
  )
}
