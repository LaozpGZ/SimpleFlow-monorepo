import { useTranslation } from '@pancakeswap/localization'
import { Currency, ERC20Token, UnifiedCurrency } from '@pancakeswap/sdk'
import { AutoRow, Box, PreTitle, Text } from '@pancakeswap/uikit'
import { CurrencySelectV2 } from 'components/CurrencySelectV2'
import { CommonBasesType } from 'components/SearchModal/types'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useCurrencies } from 'views/CreateLiquidityPool/hooks/useCurrencies'
import { useFieldSelectCurrencies } from 'views/CreateLiquidityPool/hooks/useFieldSelectCurrencies'

export const FieldSelectCurrency = ({
  selectedCurrency,
  otherSelectedCurrency,
  onCurrencySelect,
}: {
  selectedCurrency?: Currency | ERC20Token
  otherSelectedCurrency?: Currency | ERC20Token
  onCurrencySelect: (currency: UnifiedCurrency) => void
}) => {
  const { chainId } = useSelectIdRouteParams()

  return (
    <CurrencySelectV2
      id="create-liquidity-form-select-base-currency"
      chainId={chainId}
      selectedCurrency={selectedCurrency}
      otherSelectedCurrency={otherSelectedCurrency}
      onCurrencySelect={onCurrencySelect}
      showCommonBases
      commonBasesType={CommonBasesType.LIQUIDITY}
      hideBalance
    />
  )
}

export const StableNGFieldSelectCurrencies = () => {
  const { t } = useTranslation()
  const { baseCurrency, quoteCurrency } = useCurrencies()
  const { handleBaseCurrencySelect, handleQuoteCurrencySelect } = useFieldSelectCurrencies()

  return (
    <Box>
      <PreTitle mb="8px">{t('Choose Token Pair')}</PreTitle>
      <AutoRow gap="24px">
        <AutoRow gap="8px">
          <PreTitle color="textSubtle">{t('TOKEN A')}</PreTitle>
          <FieldSelectCurrency
            selectedCurrency={baseCurrency}
            otherSelectedCurrency={quoteCurrency}
            onCurrencySelect={handleBaseCurrencySelect}
          />
        </AutoRow>
        <AutoRow gap="8px">
          <PreTitle color="textSubtle">{t('TOKEN B')}</PreTitle>
          <FieldSelectCurrency
            selectedCurrency={quoteCurrency}
            otherSelectedCurrency={baseCurrency}
            onCurrencySelect={handleQuoteCurrencySelect}
          />
        </AutoRow>
      </AutoRow>
    </Box>
  )
}
