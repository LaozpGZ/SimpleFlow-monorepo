import { atomFamily } from 'jotai/utils'
import { atomWithAsyncRetry } from 'utils/atomWithAsyncRetry'

export const disableAddingLiquidityAtom = atomFamily((id: string | number) =>
  atomWithAsyncRetry<boolean>({
    asyncFn: async () => {
      const response = await fetch(`/api/position-managers?id=${id}`)
      if (!response.ok) throw new Error(`Failed to fetch disableAddingLiquidity for ID: ${id}`)
      const data = await response.json()
      return data.disableAddingLiquidity as boolean
    },
    fallbackValue: false,
  }),
)
