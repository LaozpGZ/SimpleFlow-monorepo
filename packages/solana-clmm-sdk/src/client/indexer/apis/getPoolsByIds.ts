import { IndexerApiClient } from '../client'
import { getMintMetaFromDAS } from './getMintMetaData'
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

  let tokenMints: string[] = []

  if (!resp.data || !resp.data.success) {
    return undefined
  }

  resp.data?.data.forEach((pool) => {
    tokenMints.push(...[pool.mintA.address, pool.mintB.address])
  })

  tokenMints = Array.from(new Set(tokenMints)) // Remove duplicates

  if (!tokenMints.length) {
    return resp.data
  }

  const mintsMetaData = await Promise.all(
    tokenMints.map((mint) =>
      getMintMetaFromDAS(mint)
        .then((res) => res?.data)
        .catch(() => undefined)
    )
  )
  resp.data.data.forEach((pool) => {
    const mintAData = mintsMetaData.find((meta) => meta?.address === pool.mintA.address)
    const mintBData = mintsMetaData.find((meta) => meta?.address === pool.mintB.address)

    // eslint-disable-next-line
    pool.mintA.programId = mintAData?.programId
    // eslint-disable-next-line
    pool.mintB.programId = mintBData?.programId
  })

  return resp.data
}
