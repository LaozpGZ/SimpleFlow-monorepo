import { Box, IconButton, Input, SwapHorizIcon, Text } from '@pancakeswap/uikit'
import { useAtomValue, useSetAtom } from 'jotai'
import styled from 'styled-components'
import { Suspense } from 'react'
import { useStablecoinPrice } from 'hooks/useStablecoinPrice'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { baseCurrencyAtom, flipCurrenciesAtom, quoteCurrencyAtom } from '../state/currencyAtoms'

const InputContainer = styled(Box)`
  position: relative;
  width: 100%;
`

const StyledInput = styled(Input).attrs({ scale: 'lg' })`
  height: 100px;

  padding-top: 24px;
  padding-bottom: 16px;
  padding-left: 40%;

  border-radius: 24px;

  text-align: right;
  font-size: 24px;
  font-weight: 600;
`

const InputTopLeft = styled(Box)`
  position: absolute;
  top: 12px;
  left: 16px;
`

const InputTopRight = styled(Box)`
  position: absolute;
  top: 12px;
  right: 16px;
`

const InputBottomBar = styled(Box)`
  position: absolute;

  width: fit-content;

  bottom: 8px;
  right: 16px;

  text-align: right;
`

const InputLeftBox = styled(Box)`
  position: absolute;

  left: 16px;
  top: 48%;
`

function truncateString(str: string, maxLength: number) {
  if (!str || typeof str !== 'string') return ''
  if (str.length < maxLength) return str
  return `${str.slice(0, maxLength)}...`
}

export const MarketPriceInput = () => {
  const baseCurrency = useAtomValue(baseCurrencyAtom)
  const quoteCurrency = useAtomValue(quoteCurrencyAtom)

  const priceUsd = useStablecoinPrice(quoteCurrency, { enabled: !!quoteCurrency })
  // TODO: Calculate usd price based on market price input amount
  const amount = 0n
  const usdValue = priceUsd ? amount * priceUsd?.quotient : 0n

  // TODO: Check market price flipping logic according to lower/upper ticks
  const flipCurrencies = useSetAtom(flipCurrenciesAtom)

  if (!baseCurrency || !quoteCurrency) return null

  return (
    <Suspense>
      <InputContainer>
        <InputTopLeft>
          <Text color="textSubtle" small>
            Sell when 1{' '}
            <Text as="span" color="textSubtle" small bold>
              {truncateString(baseCurrency.symbol, 15)}
            </Text>{' '}
            is worth:
          </Text>
        </InputTopLeft>
        <InputTopRight>
          <IconButton variant="text" scale="xs" onClick={flipCurrencies}>
            <SwapHorizIcon color="primary60" width="18px" />
          </IconButton>
        </InputTopRight>
        <InputLeftBox>
          <Text color="textSubtle" fontSize="20px" bold>
            {truncateString(quoteCurrency.symbol, 15)}
          </Text>
        </InputLeftBox>
        <StyledInput type="number" placeholder="0.00" />
        {priceUsd && (
          <InputBottomBar>
            <Text color="textSubtle" small>
              ~{formatDollarAmount(+usdValue.toString(), undefined, false)} USD
            </Text>
          </InputBottomBar>
        )}
      </InputContainer>
    </Suspense>
  )
}
