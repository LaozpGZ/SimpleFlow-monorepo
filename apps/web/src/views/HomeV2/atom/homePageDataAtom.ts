import { atom } from 'jotai'
import { HomePageData } from 'pages/api/home/types'
import retry from 'async-retry'

const MAX_RETRY = 5

export const homePageDataAtom = atom(async () => {
  return retry(
    async (_, retryAttempt) => {
      if (retryAttempt === MAX_RETRY + 1) {
        return {
          tokens: [],
          pools: [],
          currencies: [],
          chains: [],
          cakeRelated: undefined,
          stats: undefined,
          partners: [],
          topWinner: undefined,
        }
      }
      const resp = await fetch('/api/home')
      if (!resp.ok) {
        throw resp
      }
      const data = await resp.json()
      return data as HomePageData
    },
    {
      retries: MAX_RETRY,
      minTimeout: 250,
      maxTimeout: 1000,
    },
  )
})
