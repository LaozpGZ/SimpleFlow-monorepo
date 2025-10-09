import { useTranslation } from '@pancakeswap/localization'
import { Currency, ERC20Token, UnifiedCurrency } from '@pancakeswap/sdk'
import { AutoRow, Box, Checkbox, Flex, Input, PreTitle, Text } from '@pancakeswap/uikit'
import { CurrencySelectV2 } from 'components/CurrencySelectV2'
import { CommonBasesType } from 'components/SearchModal/types'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useState } from 'react'
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

function CardCheckBox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <Flex alignItems="center" style={{ cursor: 'pointer' }} onClick={onChange}>
      <Text bold small color="textSubtle" mr="4px">
        {label}
      </Text>
      <Checkbox scale="sm" checked={checked} onChange={onChange} />
    </Flex>
  )
}

function CardCheckRadioGroup() {
  const { t } = useTranslation()
  const [selectedType, setSelectedType] = useState<'Standard' | 'Oracle'>('Standard')
  const [address, setAddress] = useState('')
  const [functionName, setFunctionName] = useState('')

  return (
    <>
      <AutoRow gap="16px">
        <CardCheckBox
          label={t('Standard')}
          checked={selectedType === 'Standard'}
          onChange={() => setSelectedType('Standard')}
        />
        <CardCheckBox
          label={t('Oracle')}
          checked={selectedType === 'Oracle'}
          onChange={() => setSelectedType('Oracle')}
        />
      </AutoRow>
      {selectedType === 'Oracle' && (
        <>
          <AutoRow gap="8px">
            <PreTitle textTransform="uppercase">{t('Address')}</PreTitle>
            <Input type="text" placeholder="0x123..." value={address} onChange={(e) => setAddress(e.target.value)} />
          </AutoRow>
          <AutoRow gap="8px">
            <PreTitle textTransform="uppercase">{t('Function')}</PreTitle>
            <Input
              type="text"
              placeholder="ExchangeRate()"
              value={functionName}
              onChange={(e) => setFunctionName(e.target.value)}
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
          <CardCheckRadioGroup />
        </AutoRow>
        <AutoRow gap="8px">
          <PreTitle color="textSubtle">{t('TOKEN B')}</PreTitle>
          <FieldSelectCurrency
            selectedCurrency={quoteCurrency as Currency | undefined}
            otherSelectedCurrency={baseCurrency as Currency | undefined}
            onCurrencySelect={handleQuoteCurrencySelect}
          />
          <CardCheckRadioGroup />
        </AutoRow>
      </AutoRow>
    </Box>
  )
}
