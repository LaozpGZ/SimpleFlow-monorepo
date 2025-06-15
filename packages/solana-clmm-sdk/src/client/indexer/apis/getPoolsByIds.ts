import { IndexerApiClient } from '../client'
import { PoolInfo } from './types'

export const getPoolsByIds = async (
  ids: string[]
): Promise<
  | {
      id: string
      success: boolean
      data: PoolInfo[]
    }
  | undefined
> => {
  const resp = await IndexerApiClient.GET('/cached/v1/pools/info/ids', {
    params: {
      query: {
        ids: ids.join(','),
      },
    },
  })

  return resp.data
}
