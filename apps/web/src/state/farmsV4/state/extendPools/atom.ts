import { useMemo } from 'react'
import { ChainId } from '@pancakeswap/chains'
import { Protocol, supportedChainIdV4 } from '@pancakeswap/farms'
import { atom, useAtom, useAtomValue } from 'jotai'
import { type Address, isAddress } from 'viem'
import { isAddressEqual } from 'utils'
import uniqWith from 'lodash/uniqWith'
import isEqual from 'lodash/isEqual'
import { farmPoolsAtom } from '../farmPools/atom'
import { ChainIdAddressKey, PoolInfo } from '../type'

export enum PoolSortBy {
  APR = 'apr24h',
  TVL = 'tvlUSD',
  VOL = 'volumeUSD24h',
}

export interface FetchPoolsProps {
  protocols?: Protocol[]
  chains?: ChainId[]
  tokens?: ChainIdAddressKey[]
  pageNo?: number
}

export type ExtendPoolsQuery = FetchPoolsProps & {
  orderBy: PoolSortBy
  pools?: ChainIdAddressKey[]
  before: string
  after: string
}

export const DEFAULT_QUERIES = {
  protocols: Object.values(Protocol),
  orderBy: PoolSortBy.VOL,
  chains: [...supportedChainIdV4],
  pools: [],
  tokens: [],
  before: '',
  after: '',
}

export const useExtendPoolsAtom = () => {
  const [pools, setPools] = useAtom(extendPoolsAtom)
  const farms = useAtomValue(farmPoolsAtom)

  return useMemo(
    () => ({
      pools,
      setPools: (values: PoolInfo[], replaced = false, removeFarms = false) => {
        // remove duplicates pools with farmPoolsAtom
        const newData = removeFarms
          ? values.filter(
              (pool) =>
                !farms.some(
                  (farm) =>
                    isAddress(pool.lpAddress) &&
                    isAddressEqual(farm.lpAddress, pool.lpAddress) &&
                    farm.protocol === pool.protocol,
                ),
            )
          : values

        setPools(replaced ? newData : uniqWith(pools.concat(newData), isEqual))
      },
    }),
    [farms, pools, setPools],
  )
}

export const extendPoolsAtom = atom([] as PoolInfo[])

interface PoolsOfPositionType {
  [address: Address]: PoolInfo
}
export const poolsOfPositionAtom = atom({} as PoolsOfPositionType)
