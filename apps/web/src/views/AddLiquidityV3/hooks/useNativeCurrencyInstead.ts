import { Currency } from '@pancakeswap/sdk'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import useNativeCurrency from 'hooks/useNativeCurrency'
import currencyId from 'utils/currencyId'
import { useIsMounted } from '@pancakeswap/hooks'

interface UseNativeCurrencyInsteadProps {
  baseCurrency: Currency | null | undefined
  quoteCurrency: Currency | null | undefined
  feeAmount: number | undefined
}

export const useNativeCurrencyInstead = ({ baseCurrency, quoteCurrency, feeAmount }: UseNativeCurrencyInsteadProps) => {
  const router = useRouter()
  const native = useNativeCurrency()

  const runOnce = useRef(false)

  const [useNativeInstead, setUseNativeInstead] = useState<boolean>(false)

  useEffect(() => {
    if (runOnce.current || !router.isReady) return
    runOnce.current = true

    setUseNativeInstead(router.query.currency?.includes(native.symbol) || false)
  }, [router.query.currency, native.symbol, router.isReady])

  const canUseNativeCurrency = useMemo(() => {
    return (
      baseCurrency?.wrapped.address === native.wrapped.address ||
      quoteCurrency?.wrapped.address === native.wrapped.address
    )
  }, [baseCurrency, native, quoteCurrency])

  const handleUseNative = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked

      if (!baseCurrency || !quoteCurrency) return

      if (checked) {
        // Turn Wrapped Currency to Native
        const replaceCurrency0 = baseCurrency?.wrapped.address === native.wrapped.address

        const newCurrencyQuery = replaceCurrency0
          ? [native.symbol, currencyId(quoteCurrency)]
          : [currencyId(baseCurrency), native.symbol]

        if (feeAmount) {
          newCurrencyQuery.push(feeAmount.toString())
        }

        router.replace({
          query: {
            ...router.query,
            // @ts-ignore
            currency: newCurrencyQuery,
          },
        })
      } else {
        // Turn Native to Wrapped Currency
        router.replace({
          query: {
            ...router.query,
            currency: [
              baseCurrency?.wrapped.address ?? '',
              quoteCurrency?.wrapped.address ?? '',
              feeAmount?.toString() ?? '',
            ],
          },
        })
      }

      setUseNativeInstead(event.target.checked)
    },
    [baseCurrency, currencyId, feeAmount, native, quoteCurrency, router],
  )

  return {
    canUseNativeCurrency,
    handleUseNative,
    useNativeInstead,
  }
}
