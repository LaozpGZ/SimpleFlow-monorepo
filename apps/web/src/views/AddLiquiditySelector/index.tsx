import { useTranslation } from '@pancakeswap/localization'
import { UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import {
  AddIcon,
  Button,
  ButtonMenu,
  ButtonMenuItem,
  Card,
  CardBody,
  FlexGap,
  PreTitle,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { getCurrencyAddress } from '@pancakeswap/widgets-internal'
import { NetworkSelector } from 'components/NetworkSelector'
import { CommonBasesType } from 'components/SearchModal/types'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { useUnifiedCurrency } from 'hooks/Tokens'
import NextLink from 'next/link'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import currencyId from 'utils/currencyId'
import { TokenFilterContainer } from 'views/AddLiquidityInfinity/components/styles'
import { Chain } from '@pancakeswap/chains'

import { CurrencySelectV2 } from 'components/CurrencySelectV2'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { COMPACT_LIQUIDITY_TYPES, LIQUIDITY_TYPES, LiquidityType } from 'utils/types'
import { PERSIST_CHAIN_KEY } from 'config/constants'

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 432px;
`

const StyledButtonMenuItem = styled(ButtonMenuItem)`
  height: 38px;
  text-transform: capitalize;
`

export const AddLiquiditySelector = () => {
  /// Hooks
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  const { chainId, protocol, currencyIdA, currencyIdB, updateParams } = useSelectIdRouteParams()
  const queryChainName = chainId && CHAIN_QUERY_NAME[chainId]
  const baseCurrency = useUnifiedCurrency(currencyIdA, chainId)
  const currencyB = useUnifiedCurrency(currencyIdB, chainId)
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped) ? undefined : currencyB

  const types = useMemo(() => {
    return isMobile ? COMPACT_LIQUIDITY_TYPES : LIQUIDITY_TYPES
  }, [isMobile])

  /// Functions
  const onLiquidityTypeClick = useCallback(
    (index: number) => {
      updateParams({ protocol: LIQUIDITY_TYPES[index] })
    },
    [updateParams],
  )

  // TODO: implement relevant checks for native, token collision, etc. like in AddLiquidityV3
  const handleCurrencyASelect = useCallback(
    (currency: UnifiedCurrency) => {
      updateParams({ currencyIdA: currencyId(currency) })
    },
    [updateParams],
  )

  const handleCurrencyBSelect = useCallback(
    (currency: UnifiedCurrency) => {
      updateParams({ currencyIdB: currencyId(currency) })
    },
    [updateParams],
  )

  const nextStepURLMap = useMemo(() => {
    const queries = {
      chain: queryChainName,
      [PERSIST_CHAIN_KEY]: 1,
    }

    const queryParams = new URLSearchParams()
    for (const [key, value] of Object.entries(queries)) {
      if (typeof value === 'undefined' || value === '') {
        continue
      }
      if (Array.isArray(value)) {
        value.forEach((item) => queryParams.append(key, item))
      } else {
        queryParams.append(key, value)
      }
    }
    const tokenParams =
      baseCurrency && quoteCurrency ? `${getCurrencyAddress(baseCurrency)}/${getCurrencyAddress(quoteCurrency)}` : ''

    const baseToken = baseCurrency?.isNative ? baseCurrency.symbol : baseCurrency?.wrapped.address
    const quoteToken = quoteCurrency?.isNative ? quoteCurrency.symbol : quoteCurrency?.wrapped.address

    return {
      v3: `/add/${baseToken}/${quoteToken}?${queryParams.toString()}`,
      v2: `/add/${baseToken}/${quoteToken}?${queryParams.toString()}`,
      infinity: `/liquidity/add/${queryChainName}/infinity/${baseToken}/${quoteToken}?${queryParams.toString()}`,
      stableSwap: `/add/${baseToken}/${quoteToken}?${queryParams.toString()}`,
    } satisfies Record<LiquidityType, string>
  }, [baseCurrency, quoteCurrency, chainId, queryChainName])

  const nextStep = useMemo(() => {
    const key = protocol ?? 'v3'
    return nextStepURLMap[key]
  }, [protocol, nextStepURLMap])

  const disabled = useMemo(() => {
    const noCurrency = !baseCurrency || !quoteCurrency
    const networkNoSupport = !chainId

    return noCurrency || networkNoSupport
  }, [baseCurrency, chainId, quoteCurrency])

  const { switchNetwork } = useSwitchNetwork()

  const handleNetworkChange = useCallback(
    async (chain: Chain) => {
      await switchNetwork?.(chain.id)
      updateParams({ chainId: chain.id })
    },
    [switchNetwork, updateParams],
  )

  return (
    <StyledCard mt="48px" mb={['120px', null, null, '0px']} mx="auto" style={{ overflow: 'visible' }}>
      <CardBody>
        <FlexGap gap="24px" flexDirection="column">
          <FlexGap gap="6px" flexDirection="column">
            <PreTitle>{t('1. Select where to provide liquidity')}</PreTitle>
            <ButtonMenu
              activeIndex={protocol ? LIQUIDITY_TYPES.indexOf(protocol) : 0}
              onItemClick={onLiquidityTypeClick}
              scale="sm"
              variant="subtle"
              fullWidth
            >
              {types.map((type) => (
                <StyledButtonMenuItem key={type}>{type}</StyledButtonMenuItem>
              ))}
            </ButtonMenu>

            <NetworkSelector version={protocol} chainId={chainId} onChange={handleNetworkChange} />
          </FlexGap>

          <FlexGap gap="6px" flexDirection="column">
            <PreTitle>{t('2. Choose token pair')}</PreTitle>

            <TokenFilterContainer>
              <CurrencySelectV2
                id="add-liquidity-select-tokenA"
                chainId={chainId}
                selectedCurrency={baseCurrency}
                onCurrencySelect={handleCurrencyASelect}
                showCommonBases
                commonBasesType={CommonBasesType.LIQUIDITY}
                hideBalance
                showNative
              />
              <AddIcon color="textSubtle" />
              <CurrencySelectV2
                id="add-liquidity-select-tokenB"
                chainId={chainId}
                selectedCurrency={quoteCurrency}
                onCurrencySelect={handleCurrencyBSelect}
                showCommonBases
                commonBasesType={CommonBasesType.LIQUIDITY}
                hideBalance
                showNative
              />
            </TokenFilterContainer>
          </FlexGap>

          <NextLink href={nextStep}>
            <Button px="100px" width="100%" disabled={disabled}>
              {t('Next.step')}
            </Button>
          </NextLink>
        </FlexGap>
      </CardBody>
    </StyledCard>
  )
}
