import { CurrencySelect } from 'components/CurrencySelect'
import { CommonBasesType } from 'components/SearchModal/types'

import { Currency, NATIVE, Pair, WNATIVE } from '@pancakeswap/sdk'
import {
  AddIcon,
  AutoColumn,
  Box,
  Card,
  CardBody,
  Container,
  DynamicSection,
  FlexGap,
  IconButton,
  PreTitle,
  RefreshIcon,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'

import { FeeAmount, Pool } from '@pancakeswap/v3-sdk'
import React, { ReactNode, useCallback, useEffect, useMemo } from 'react'

import { Trans, useTranslation } from '@pancakeswap/localization'
import { useRouter } from 'next/router'
import currencyId from 'utils/currencyId'

import { AppHeader } from 'components/App'
import { atom, useAtom } from 'jotai'
import { styled } from 'styled-components'

import { usePreviousValue } from '@pancakeswap/hooks'
import { useCurrency } from 'hooks/Tokens'
import AddLiquidity from 'views/AddLiquidity'
import AddStableLiquidity from 'views/AddLiquidity/AddStableLiquidity'
import useWarningLiquidity from 'views/AddLiquidity/hooks/useWarningLiquidity'
import useStableConfig, { StableConfigContext } from 'views/Swap/hooks/useStableConfig'

import { useActiveChainId } from 'hooks/useActiveChainId'
import noop from 'lodash/noop'
import { usePoolInfo } from 'state/farmsV4/state/extendPools/hooks'
import { resetMintState } from 'state/mint/actions'
import { useAddLiquidityV2FormDispatch } from 'state/mint/reducer'
import { safeGetAddress } from 'utils'
import { PoolInfoHeader } from 'components/PoolInfoHeader'

import { AprCalculatorV2 } from './components/AprCalculatorV2'
import { StableV3Selector } from './components/StableV3Selector'
import { V2Selector } from './components/V2Selector'
import StableFormView from './formViews/StableFormView'
import V2FormView from './formViews/V2FormView'
import V3FormView from './formViews/V3FormView'
import { useCurrencyParams } from './hooks/useCurrencyParams'
import { HandleFeePoolSelectFn, SELECTOR_TYPE } from './types'
import FeeSelector from './formViews/V3FormView/components/FeeSelector'

/* two-column layout where DepositAmount is moved at the very end on mobile. */
export const ResponsiveTwoColumns = styled.div<{ $singleColumn?: boolean }>`
  display: grid;
  grid-column-gap: 32px;
  grid-row-gap: 16px;
  grid-template-columns: 1fr;

  grid-template-rows: max-content;
  grid-auto-flow: row;

  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: ${({ $singleColumn }) => ($singleColumn ? '1fr' : '3fr 2fr')};
  }
`

const selectTypeAtom = atom(SELECTOR_TYPE.V3)

interface UniversalAddLiquidityPropsType {
  currencyIdA?: string
  currencyIdB?: string
  preferredSelectType?: SELECTOR_TYPE
  preferredFeeAmount?: FeeAmount
}

export function UniversalAddLiquidity({
  currencyIdA,
  currencyIdB,
  preferredSelectType,
  preferredFeeAmount,
}: UniversalAddLiquidityPropsType) {
  const { chainId } = useActiveChainId()
  const { t } = useTranslation()

  const dispatch = useAddLiquidityV2FormDispatch()

  useEffect(() => {
    if (!currencyIdA && !currencyIdB) {
      dispatch(resetMintState())
    }
  }, [dispatch, currencyIdA, currencyIdB])

  const router = useRouter()
  const baseCurrency = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)
  const warningHandler = useWarningLiquidity(currencyIdA, currencyIdB)

  const stableConfig = useStableConfig({
    tokenA: baseCurrency,
    tokenB: currencyB,
  })

  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped) ? undefined : currencyB

  const [, , feeAmountFromUrl] = router.query.currency || []

  // fee selection from url
  const feeAmount: FeeAmount | undefined = useMemo(() => {
    return (
      preferredFeeAmount ||
      (feeAmountFromUrl && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))
        ? parseFloat(feeAmountFromUrl)
        : undefined)
    )
  }, [preferredFeeAmount, feeAmountFromUrl])

  const handleCurrencySelect = useCallback(
    (currencyNew: Currency, currencyIdOther?: string): (string | undefined)[] => {
      const currencyIdNew = currencyId(currencyNew)

      if (currencyIdNew === currencyIdOther) {
        // not ideal, but for now clobber the other if the currency ids are equal
        return [currencyIdNew, undefined]
      }
      // prevent wnative + native
      const isNATIVEOrWNATIVENew =
        currencyNew?.isNative || (chainId !== undefined && currencyIdNew === WNATIVE[chainId]?.address)
      const isNATIVEOrWNATIVEOther =
        currencyIdOther !== undefined &&
        ((chainId && currencyIdOther === NATIVE[chainId]?.symbol) ||
          (chainId !== undefined && safeGetAddress(currencyIdOther) === WNATIVE[chainId]?.address))

      if (isNATIVEOrWNATIVENew && isNATIVEOrWNATIVEOther) {
        return [currencyIdNew, undefined]
      }

      return [currencyIdNew, currencyIdOther]
    },
    [chainId],
  )

  const handleCurrencyASelect = useCallback(
    (currencyANew: Currency) => {
      warningHandler(currencyANew)
      const [idA, idB] = handleCurrencySelect(currencyANew, currencyIdB)
      const newPathname = router.pathname.replace('/v2', '').replace('/stable', '')
      const { minPrice: _minPrice, maxPrice: _maxPrice, ...rest } = router.query
      if (idB === undefined) {
        router.replace(
          {
            pathname: newPathname,
            query: {
              ...rest,
              currency: [idA!],
            },
          },
          undefined,
          { shallow: true },
        )
      } else {
        router.replace(
          {
            pathname: newPathname,
            query: {
              ...rest,
              currency: [idA!, idB!],
            },
          },
          undefined,
          { shallow: true },
        )
      }
    },
    [handleCurrencySelect, currencyIdB, router],
  )

  const handleCurrencyBSelect = useCallback(
    (currencyBNew: Currency) => {
      warningHandler(currencyBNew)
      const [idB, idA] = handleCurrencySelect(currencyBNew, currencyIdA)
      const newPathname = router.pathname.replace('/v2', '').replace('/stable', '')
      const { minPrice: _minPrice, maxPrice: _maxPrice, ...rest } = router.query
      if (idA === undefined) {
        router.replace(
          {
            pathname: newPathname,
            query: {
              ...rest,
              currency: [idB!],
            },
          },
          undefined,
          { shallow: true },
        )
      } else {
        router.replace(
          {
            pathname: newPathname,
            query: {
              ...rest,
              currency: [idA!, idB!],
            },
          },
          undefined,
          { shallow: true },
        )
      }
    },
    [handleCurrencySelect, currencyIdA, router],
  )

  const [selectorType, setSelectorType] = useAtom(selectTypeAtom)

  const prevPreferredSelectType = usePreviousValue(preferredSelectType)

  useEffect(() => {
    if (!currencyIdA || !currencyIdB) return

    if (selectorType === SELECTOR_TYPE.V3 && preferredSelectType === SELECTOR_TYPE.V3) {
      return
    }

    // if fee selection from url, don't change the selector type to avoid keep selecting stable when url changes, e.g. toggle rate
    if (!stableConfig.stableSwapConfig && feeAmountFromUrl) return
    if (preferredSelectType === SELECTOR_TYPE.STABLE && stableConfig.stableSwapConfig) {
      setSelectorType(SELECTOR_TYPE.STABLE)
    } else {
      setSelectorType(preferredSelectType || SELECTOR_TYPE.V3)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currencyIdA,
    currencyIdB,
    feeAmountFromUrl,
    preferredSelectType,
    prevPreferredSelectType,
    setSelectorType,
    stableConfig.stableSwapConfig,
  ])

  // const handleFeePoolSelect = useCallback<HandleFeePoolSelectFn>(
  //   ({ type, feeAmount: newFeeAmount }) => {
  //     setSelectorType(type)
  //     if (type === SELECTOR_TYPE.V3) {
  //       const newPathname = router.pathname.replace('/stable', '').replace('/v2', '')
  //       router.replace(
  //         {
  //           pathname: newPathname,
  //           query: {
  //             ...router.query,
  //             currency: newFeeAmount
  //               ? [currencyIdA!, currencyIdB!, newFeeAmount.toString()]
  //               : [currencyIdA!, currencyIdB!],
  //           },
  //         },
  //         undefined,
  //         { shallow: true },
  //       )
  //     } else {
  //       router.replace(
  //         {
  //           pathname: router.pathname,
  //           query: router.query,
  //         },
  //         type === SELECTOR_TYPE.STABLE
  //           ? `/stable/add/${currencyIdA}/${currencyIdB}`
  //           : `/v2/add/${currencyIdA}/${currencyIdB}`,
  //         { shallow: true },
  //       )
  //     }
  //   },
  //   [currencyIdA, currencyIdB, router, setSelectorType],
  // )

  // useEffect(() => {
  //   if (preferredFeeAmount && !feeAmountFromUrl && selectorType === SELECTOR_TYPE.V3) {
  //     handleFeePoolSelect({ type: selectorType, feeAmount: preferredFeeAmount })
  //   }
  // }, [preferredFeeAmount, feeAmountFromUrl, handleFeePoolSelect, selectorType])

  return (
    <>
      <Box mt="24px">
        <ResponsiveTwoColumns
          $singleColumn={selectorType === SELECTOR_TYPE.V2 || selectorType === SELECTOR_TYPE.STABLE}
        >
          {selectorType === SELECTOR_TYPE.V3 && (
            <V3FormView
              feeAmount={feeAmount}
              baseCurrency={baseCurrency}
              quoteCurrency={quoteCurrency}
              currencyIdA={currencyIdA}
              currencyIdB={currencyIdB}
            />
          )}
          {selectorType === SELECTOR_TYPE.V2 && (
            <AddLiquidity currencyA={baseCurrency} currencyB={quoteCurrency}>
              {(props) => <V2FormView {...props} />}
            </AddLiquidity>
          )}
          {selectorType === SELECTOR_TYPE.STABLE && (
            <StableConfigContext.Provider value={stableConfig}>
              <AddStableLiquidity currencyA={baseCurrency} currencyB={quoteCurrency}>
                {(props) => (
                  <StableFormView {...props} stableTotalFee={stableConfig?.stableSwapConfig?.stableTotalFee} />
                )}
              </AddStableLiquidity>
            </StableConfigContext.Provider>
          )}
        </ResponsiveTwoColumns>
      </Box>
    </>
  )
}

export function AddLiquidityV3Layout({
  showRefreshButton = false,
  handleRefresh,
  children,
}: {
  showRefreshButton?: boolean
  handleRefresh?: () => void
  children: React.ReactNode
}) {
  const { chainId } = useActiveChainId()

  const [selectType] = useAtom(selectTypeAtom)
  const { currencyIdA, currencyIdB, feeAmount } = useCurrencyParams()

  const baseCurrency = useCurrency(currencyIdA)
  const quoteCurrency = useCurrency(currencyIdB)

  const stableConfig = useStableConfig({
    tokenA: baseCurrency,
    tokenB: quoteCurrency,
  })

  const poolAddress = useMemo(
    () =>
      baseCurrency?.wrapped && quoteCurrency?.wrapped
        ? selectType === SELECTOR_TYPE.V3 && feeAmount
          ? Pool.getAddress(baseCurrency.wrapped, quoteCurrency.wrapped, feeAmount)
          : selectType === SELECTOR_TYPE.V2
          ? Pair.getAddress(baseCurrency.wrapped, quoteCurrency.wrapped)
          : selectType === SELECTOR_TYPE.STABLE
          ? stableConfig.stableSwapConfig?.stableSwapAddress
          : undefined
        : undefined,
    [baseCurrency?.wrapped, feeAmount, quoteCurrency?.wrapped, selectType],
  )

  const pool = usePoolInfo({ poolAddress, chainId })

  const inverted = useMemo(
    () =>
      Boolean(
        pool?.token0 &&
          pool?.token1 &&
          pool?.token0?.wrapped.address !== pool?.token1?.wrapped.address &&
          pool?.token0?.wrapped.address !== baseCurrency?.wrapped.address,
      ),
    [pool, baseCurrency],
  )

  return (
    <Container mx="auto" my="24px" maxWidth="1200px">
      <PoolInfoHeader
        linkType="addLiquidity"
        poolInfo={pool}
        chainId={chainId}
        currency0={pool?.token0 ?? baseCurrency ?? undefined}
        currency1={pool?.token1 ?? quoteCurrency ?? undefined}
        isInverted={inverted}
        poolId={poolAddress}
        overrideAprDisplay={
          selectType === SELECTOR_TYPE.V3
            ? {
                aprDisplay: (
                  <AprCalculatorV2 pool={pool} inverted={inverted} showTitle={false} derived showApyButton={false} />
                ),
                roiCalculator: (
                  <AprCalculatorV2 pool={pool} inverted={inverted} showTitle={false} derived showApyText={false} />
                ),
              }
            : undefined
        }
      />

      {children}
    </Container>
  )
}
