import { useTranslation } from '@pancakeswap/localization'
import { Currency, ERC20Token, UnifiedCurrency } from '@pancakeswap/sdk'
import { AutoRow, Box, Input, PreTitle } from '@pancakeswap/uikit'
import { CurrencySelectV2 } from 'components/CurrencySelectV2'
import { CommonBasesType } from 'components/SearchModal/types'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useState } from 'react'
import { Address, Hex, toFunctionSelector } from 'viem'
import { useCurrencies } from 'views/CreateLiquidityPool/hooks/useCurrencies'
import { useFieldSelectCurrencies } from 'views/CreateLiquidityPool/hooks/useFieldSelectCurrencies'
import { CurrencyField } from 'utils/types'
import { TokenType } from '../sdk/types'
import { ADDRESS_ZERO, NULL_METHOD_ID } from '../sdk/constants'
import { useTokenConfig } from '../contexts/TokenConfigContext'
import { CardCheckBox } from './shared/CardCheckBox'

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

export const CardCheckRadioGroup = ({ field }: { field: CurrencyField }) => {
  const { t } = useTranslation()
  const { tokenAConfig, tokenBConfig, setTokenAConfig, setTokenBConfig } = useTokenConfig()
  const [functionSignature, setFunctionSignature] = useState('')

  const config = field === CurrencyField.CURRENCY_A ? tokenAConfig : tokenBConfig
  const setConfig = field === CurrencyField.CURRENCY_A ? setTokenAConfig : setTokenBConfig

  const handleTypeChange = (type: TokenType) => {
    setConfig({
      ...config,
      type,
      ...(type === TokenType.STANDARD && {
        oracleAddress: ADDRESS_ZERO,
        methodId: NULL_METHOD_ID as Hex,
      }),
    })
    if (type === TokenType.STANDARD) {
      setFunctionSignature('')
    }
  }

  const handleAddressChange = (address: string) => {
    setConfig({
      ...config,
      oracleAddress: (address || ADDRESS_ZERO) as Address,
    })
  }

  const handleFunctionSignatureChange = (signature: string) => {
    setFunctionSignature(signature)

    if (!signature) {
      setConfig({
        ...config,
        methodId: NULL_METHOD_ID as Hex,
      })
      return
    }

    try {
      // Convert function signature to method ID using viem
      const methodId = toFunctionSelector(signature)
      setConfig({
        ...config,
        methodId,
      })
    } catch (error) {
      // If conversion fails, set methodId to empty
      console.warn('Invalid function signature:', signature, error)
      setConfig({
        ...config,
        methodId: NULL_METHOD_ID as Hex,
      })
    }
  }

  return (
    <>
      <AutoRow gap="16px">
        <CardCheckBox
          label={t('Standard')}
          checked={config.type === TokenType.STANDARD}
          onChange={() => handleTypeChange(TokenType.STANDARD)}
        />
        <CardCheckBox
          label={t('Oracle')}
          checked={config.type === TokenType.ORACLE}
          onChange={() => handleTypeChange(TokenType.ORACLE)}
        />
      </AutoRow>
      {config.type === TokenType.ORACLE && (
        <>
          <AutoRow gap="8px">
            <PreTitle textTransform="uppercase">{t('Address')}</PreTitle>
            <Input
              type="text"
              placeholder="0x123..."
              value={config.oracleAddress === ADDRESS_ZERO ? '' : config.oracleAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
            />
          </AutoRow>
          <AutoRow gap="8px">
            <PreTitle textTransform="uppercase">{t('Function')}</PreTitle>
            <Input
              type="text"
              placeholder="ExchangeRate()"
              value={functionSignature}
              onChange={(e) => handleFunctionSignatureChange(e.target.value)}
            />
          </AutoRow>
        </>
      )}
    </>
  )
}

export const InfinityStableFieldSelectCurrencies = () => {
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
            selectedCurrency={baseCurrency as Currency | undefined}
            otherSelectedCurrency={quoteCurrency as Currency | undefined}
            onCurrencySelect={handleBaseCurrencySelect}
          />
          <CardCheckRadioGroup field={CurrencyField.CURRENCY_A} />
        </AutoRow>
        <AutoRow gap="8px">
          <PreTitle color="textSubtle">{t('TOKEN B')}</PreTitle>
          <FieldSelectCurrency
            selectedCurrency={quoteCurrency as Currency | undefined}
            otherSelectedCurrency={baseCurrency as Currency | undefined}
            onCurrencySelect={handleQuoteCurrencySelect}
          />
          <CardCheckRadioGroup field={CurrencyField.CURRENCY_B} />
        </AutoRow>
      </AutoRow>
    </Box>
  )
}
