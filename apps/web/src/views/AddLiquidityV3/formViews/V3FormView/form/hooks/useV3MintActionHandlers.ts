import { useRouter } from 'next/router'
import { Price, Token } from '@pancakeswap/swap-sdk-core'
import { useCallback } from 'react'
import { batch } from 'react-redux'
import { CurrencyField as Field } from 'utils/types'
import { typeInput, typeLeftRangeInput, typeRightRangeInput, typeStartPriceInput } from '../actions'
import { useV3FormDispatch } from '../reducer'

export function useV3MintActionHandlers(
  noLiquidity: boolean | undefined,
  routerReplace = true, // TODO: remove this when we have a better way to handle the router
): {
  onSetFullRange: () => void
  onFieldAInput: (typedValue: string | undefined) => void
  onFieldBInput: (typedValue: string) => void
  onLeftRangeInput: (typedValue: Price<Token, Token> | undefined) => void
  onRightRangeInput: (typedValue: Price<Token, Token> | undefined) => void
  onStartPriceInput: (typedValue: string) => void
  onBothRangeInput: ({
    leftTypedValue,
    rightTypedValue,
  }: {
    leftTypedValue: Price<Token, Token> | true | undefined
    rightTypedValue: Price<Token, Token> | true | undefined
  }) => void
} {
  const router = useRouter()

  const dispatch = useV3FormDispatch()

  const onFieldAInput = useCallback(
    (typedValue: string | undefined) => {
      dispatch(typeInput({ field: Field.CURRENCY_A, typedValue, noLiquidity: noLiquidity === true }))
    },
    [dispatch, noLiquidity],
  )

  const onFieldBInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ field: Field.CURRENCY_B, typedValue, noLiquidity: noLiquidity === true }))
    },
    [dispatch, noLiquidity],
  )

  const onBothRangeInput = useCallback(
    ({
      leftTypedValue,
      rightTypedValue,
    }: {
      leftTypedValue: Price<Token, Token> | true | undefined
      rightTypedValue: Price<Token, Token> | true | undefined
    }) => {
      batch(() => {
        dispatch(typeLeftRangeInput({ typedValue: leftTypedValue }))
        dispatch(typeRightRangeInput({ typedValue: rightTypedValue }))
      })

      if (routerReplace) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { minPrice, maxPrice, ...rest } = router.query

        // remove minPrice or maxPrice if its' empty
        router.replace(
          {
            pathname: router.pathname,
            query: {
              ...rest,
              ...(leftTypedValue && { minPrice: leftTypedValue === true ? 'true' : leftTypedValue.toFixed(18) }),
              ...(rightTypedValue && { maxPrice: rightTypedValue === true ? 'true' : rightTypedValue.toFixed(18) }),
            },
          },
          undefined,
          {
            shallow: true,
          },
        )
      }
    },
    [dispatch, router, routerReplace],
  )

  const onLeftRangeInput = useCallback(
    (typedValue: Price<Token, Token> | undefined) => {
      const _typedValue = typedValue?.equalTo(0) ? true : typedValue
      dispatch(typeLeftRangeInput({ typedValue: _typedValue }))
      if (routerReplace) {
        router.replace(
          {
            pathname: router.pathname,
            query: { ...router.query, minPrice: typeof _typedValue === 'boolean' ? 'true' : typedValue?.toFixed(18) },
          },
          undefined,
          {
            shallow: true,
          },
        )
      }
    },
    [dispatch, router, routerReplace],
  )

  const onRightRangeInput = useCallback(
    (typedValue: Price<Token, Token> | undefined) => {
      dispatch(typeRightRangeInput({ typedValue }))
      if (routerReplace) {
        router.replace(
          {
            pathname: router.pathname,
            query: { ...router.query, maxPrice: typedValue?.toFixed(6) },
          },
          undefined,
          {
            shallow: true,
          },
        )
      }
    },
    [dispatch, router, routerReplace],
  )

  const onStartPriceInput = useCallback(
    (typedValue: string) => {
      dispatch(typeStartPriceInput({ typedValue }))
    },
    [dispatch],
  )

  const onSetFullRange = useCallback(() => {
    onBothRangeInput({ leftTypedValue: true, rightTypedValue: true })
  }, [onBothRangeInput])

  return {
    onBothRangeInput,
    onFieldAInput,
    onFieldBInput,
    onLeftRangeInput,
    onRightRangeInput,
    onStartPriceInput,
    onSetFullRange,
  }
}
