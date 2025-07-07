import { BalanceInput, Card, Checkbox, Flex, Box, RowBetween, Text, FlexGap } from '@pancakeswap/uikit'
import { useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { useStablecoinPrice } from 'hooks/useStablecoinPrice'
import { BulletList } from 'components/BulletList'
import { multiplyPriceByAmount } from 'utils/prices'
import { Currency, Price } from '@pancakeswap/sdk'

const StyledRow = styled(RowBetween)`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 8px;
  border-radius: 16px;
`

// if amount usd is over 1000. show > 1000,
const formatAmount = (amount: string, stablePrice: Price<Currency, Currency> | undefined) => {
  const usd = multiplyPriceByAmount(stablePrice, parseFloat(amount))
  if (usd > 1000) {
    return `>1000`
  }
  return `~${usd.toFixed(2)}`
}

export const GasSponsor = () => {
  const [includeStarterGas, setIncludeStarterGas] = useState(false)
  const nativeCurrency = useNativeCurrency()
  const stablePrice = useStablecoinPrice(nativeCurrency)

  const { t } = useTranslation()

  const [amount, setAmount] = useState('')

  const handleAmountChange = (value: string) => {
    setAmount(value)
  }

  const msg = includeStarterGas ? (
    <Text mb="16px" fontSize="12px">
      {t(
        'Add a small amount of the native token to help your recipient begin their on-chain journey right after claiming.',
      )}
    </Text>
  ) : (
    <BulletList>
      <li>
        <Text fontSize="12px" display="inline">
          {t(`Claiming is gas-free for the recipient, it's a fixed amount included in the gift.`)}
        </Text>
      </li>
      <li>
        <Text fontSize="12px" display="inline">
          {t('Extra gas is added to help the recipient take on-chain actions after claiming.')}
        </Text>
      </li>
    </BulletList>
  )

  return (
    <Card>
      <Box padding="16px">
        <Flex as="label" htmlFor="hide-close-positions" alignItems="center" mb="4px">
          <Checkbox
            id="include-starter-gas"
            scale="sm"
            name="confirmed"
            type="checkbox"
            checked={includeStarterGas}
            onChange={() => setIncludeStarterGas((prev) => !prev)}
          />
          <Text ml="8px" fontSize="14px" fontWeight={600}>
            {t('Include Starter Gas')}
          </Text>
        </Flex>
        {msg}
        {includeStarterGas && (
          <StyledRow>
            <FlexGap alignItems="center" gap="8px">
              <CurrencyLogo currency={nativeCurrency} size="40px" />
              <Text fontSize="16px" fontWeight={600}>
                {nativeCurrency.symbol}
              </Text>
            </FlexGap>

            <BalanceInput
              width="120px"
              value={amount}
              onUserInput={handleAmountChange}
              placeholder="0.0"
              currencyValue={amount ? `${formatAmount(amount, stablePrice)} USD` : ''}
            />
          </StyledRow>
        )}
      </Box>
    </Card>
  )
}
