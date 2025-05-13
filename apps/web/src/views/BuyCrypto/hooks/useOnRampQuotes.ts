import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { ONRAMP_API_BASE_URL } from 'config/constants/endpoints'
import { createQueryKey, type Evaluate, type ExactPartial, type UseQueryParameters } from 'utils/reactQuery'
import { type OnRampProviderQuote, type OnRampQuotesPayload } from '../types'

const getOnRampQuotesQueryKey = createQueryKey<'fetch-onramp-quotes', [ExactPartial<OnRampQuotesPayload>]>(
  'fetch-onramp-quotes',
)

type GetOnRampQuotesQueryKey = ReturnType<typeof getOnRampQuotesQueryKey>

type GetOnRampQuoteReturnType = OnRampProviderQuote[]

export type UseOnRampQuotesReturnType<selectData = GetOnRampQuoteReturnType> = UseQueryResult<selectData, Error>

export type UseOnRampQuotesParameters<selectData = GetOnRampQuoteReturnType> = Evaluate<
  OnRampQuotesPayload &
    UseQueryParameters<Evaluate<GetOnRampQuoteReturnType>, Error, selectData, GetOnRampQuotesQueryKey>
>

export const useOnRampQuotes = <selectData = GetOnRampQuoteReturnType>(
  parameters: UseOnRampQuotesParameters<selectData>,
) => {
  const { fiatAmount, enabled, cryptoCurrency, fiatCurrency, network, onRampUnit, providerAvailabilities, ...query } =
    parameters

  return useQuery({
    ...query,
    queryKey: getOnRampQuotesQueryKey([
      {
        cryptoCurrency,
        fiatAmount,
        fiatCurrency,
        network,
        onRampUnit,
      },
    ]),
    refetchInterval: 40 * 1_000,
    staleTime: 40 * 1_000,
    enabled: Boolean(enabled),
    queryFn: async () => {
      if (!cryptoCurrency || !fiatAmount || !fiatCurrency || !onRampUnit) {
        throw new Error('Missing buy-crypto fetch-provider-quotes params')
      }

      const quotes = await fetchProviderQuotes({
        cryptoCurrency,
        fiatAmount,
        fiatCurrency,
        network,
        onRampUnit,
      })

      if (quotes.length === 0) {
        throw new Error('No quotes available')
      }

      // Filter quotes, but return original quotes if none pass the filter
      const filteredQuotes = quotes.filter((q) => providerAvailabilities[q.provider])

      // Special handling for EUR -> CAKE combination
      const isEurToCake = fiatCurrency === 'EUR' && cryptoCurrency === 'CAKE'

      if (filteredQuotes.length === 0 && isEurToCake) {
        return quotes // Return unfiltered quotes
      }

      return filteredQuotes.length > 0 ? filteredQuotes : quotes
    },
  })
}

async function fetchProviderQuotes(
  payload: Omit<OnRampQuotesPayload, 'providerAvailabilities'>,
): Promise<OnRampProviderQuote[]> {
  const response = await fetch(
    // TO UPDATE
    `${ONRAMP_API_BASE_URL}/fetch-provider-quotes`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )

  const result = await response.json()

  // Even if API returns error messages, return quotes if they exist
  if (result.result && Array.isArray(result.result) && result.result.length > 0) {
    return result.result
  }

  // If no quotes data, check for error messages
  if (result.errorMessages && Array.isArray(result.errorMessages) && result.errorMessages.length > 0) {
    // Special handling for CAKE not supported error
    if (result.errorMessages.some((msg) => msg.includes('CAKE is not supported'))) {
      return result.result || []
    }
  }

  return result.result || []
}
