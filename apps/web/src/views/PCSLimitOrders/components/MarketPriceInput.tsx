import { Box, IconButton, Input, SwapHorizIcon, Text } from '@pancakeswap/uikit'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import styled from 'styled-components'
import { ChangeEvent, Suspense, useCallback, useEffect, useState } from 'react'
import { useStablecoinPrice } from 'hooks/useStablecoinPrice'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useTranslation } from '@pancakeswap/localization'
import { tickToPrice, tryParseTick } from 'hooks/infinity/utils'
import { tryParsePrice } from 'hooks/v3/utils'
import { BigNumber as BN } from 'bignumber.js'
import { inputCurrencyAtom, outputCurrencyAtom } from '../state/currency/currencyAtoms'
import { flipCurrenciesAtom } from '../state/currency/setCurrencyAtoms'
import { customMarketPriceAtom, currentMarketPriceAtom } from '../state/form/marketPriceAtoms'
import { selectedPoolAtom } from '../state/pools/poolAtoms'

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
  const { t } = useTranslation()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)

  const pool = useAtomValue(selectedPoolAtom)

  const { data: currentMarketPrice } = useAtomValue(currentMarketPriceAtom)

  const [customMarketPrice, setCustomMarketPrice] = useAtom(customMarketPriceAtom)
  const [localPrice, setLocalPrice] = useState(currentMarketPrice)

  const tokenPriceUSD = useStablecoinPrice(outputCurrency, { enabled: !!outputCurrency })
  const usdValue =
    tokenPriceUSD && currentMarketPrice
      ? BN(currentMarketPrice)
          .multipliedBy(BN(tokenPriceUSD.toFixed(18)))
          .toFormat(6)
      : '0'

  // TODO: Check market price flipping logic according to lower/upper ticks
  const flipCurrencies = useSetAtom(flipCurrenciesAtom)

  // Sync market price to local price input
  useEffect(() => {
    // If user has not set custom market price, continue to sync values
    if (customMarketPrice === undefined && currentMarketPrice) setLocalPrice(currentMarketPrice)
  }, [customMarketPrice, currentMarketPrice, setLocalPrice])

  const handleCustomMarketPriceInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target
      if (value === currentMarketPrice) return

      setLocalPrice(value)
    },
    [currentMarketPrice, setLocalPrice],
  )

  // Adjust price based on tick and set it as new custom price
  const handleInputAdjust = useCallback(() => {
    if (!pool || !inputCurrency || !outputCurrency) return
    const {
      pool: { tickSpacing },
    } = pool

    if (localPrice === currentMarketPrice) return
    if (!localPrice) {
      setCustomMarketPrice(undefined)
      return
    }

    const localPriceBN = BN(localPrice)
    if (localPriceBN.lte(0) || localPriceBN.isNaN() || !localPriceBN.isFinite()) return

    // Get nearest tick to user's price
    const userPrice = tryParsePrice(inputCurrency, outputCurrency, localPrice)
    if (!userPrice) {
      // Reset to market price and clear custom price
      setLocalPrice(currentMarketPrice)
      setCustomMarketPrice(undefined)
      return
    }

    const nearestTick = tryParseTick(userPrice, tickSpacing)

    if (!nearestTick) {
      console.warn('MarketPriceInput::handleBlur No tick found for given price')
      // Reset to market price and clear custom price
      setLocalPrice(currentMarketPrice)
      setCustomMarketPrice(undefined)
      return
    }

    // TODO: Based on zeroForOne direction, adjust price ticks up or down
    const adjustedPrice = tickToPrice(inputCurrency, outputCurrency, nearestTick)

    setCustomMarketPrice(adjustedPrice.toSignificant(6))
    setLocalPrice(adjustedPrice.toSignificant(6))
  }, [pool, inputCurrency, outputCurrency, localPrice, setLocalPrice, setCustomMarketPrice])

  if (!inputCurrency || !outputCurrency) return null

  return (
    <Suspense>
      <InputContainer>
        <InputTopLeft>
          <Text color="textSubtle" small>
            {t('Sell when')} 1{' '}
            <Text as="span" color="textSubtle" small bold>
              {truncateString(inputCurrency.symbol, 15)}
            </Text>{' '}
            {t('is worth')}:
          </Text>
        </InputTopLeft>
        <InputTopRight>
          <IconButton variant="text" scale="xs" onClick={flipCurrencies}>
            <SwapHorizIcon color="primary60" width="18px" />
          </IconButton>
        </InputTopRight>
        <InputLeftBox>
          <Text color="textSubtle" fontSize="20px" bold>
            {truncateString(outputCurrency.symbol, 15)}
          </Text>
        </InputLeftBox>
        <StyledInput
          type="number"
          value={localPrice}
          onChange={handleCustomMarketPriceInput}
          onBlur={handleInputAdjust}
          onKeyDown={(e) => {
            if (e.code === 'Enter') {
              e.currentTarget.blur()
            }
          }}
          placeholder="0.00"
        />
        {usdValue && (
          <InputBottomBar>
            <Text color="textSubtle" small>
              ~{formatDollarAmount(+usdValue.toString(), undefined, false)} USD
            </Text>
          </InputBottomBar>
        )}
      </InputContainer>
      custom price: {customMarketPrice || 'null'}
    </Suspense>
  )
}
