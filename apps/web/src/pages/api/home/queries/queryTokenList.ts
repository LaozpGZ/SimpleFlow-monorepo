import { TokenInfo, TokenList } from '@pancakeswap/token-lists'
import { getTokenList } from '@pancakeswap/token-lists/react'
import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'
import { PANCAKE_ARB_DEFAULT, PANCAKE_BASE_DEFAULT, PANCAKE_BSC_MM, PANCAKE_ETH_DEFAULT } from 'config/constants/lists'
import keyBy from 'lodash/keyBy'
import { checksumAddress } from 'utils/checksumAddress'
import { getHomeCacheSettings } from './settings'

export const _queryTokenList = async () => {
  const list = [PANCAKE_ETH_DEFAULT, PANCAKE_BSC_MM, PANCAKE_ARB_DEFAULT, PANCAKE_BASE_DEFAULT]

  const results = await Promise.allSettled(list.map((url) => getTokenList(url)))
  const allFailed = results.every((result) => result.status === 'rejected')

  if (allFailed) {
    throw new Error('All token list failed')
  }
  const lists = results
    .filter((result): result is PromiseFulfilledResult<TokenList> => result.status === 'fulfilled')
    .map((result) => result.value.tokens)
    .flat()
    .map((x) => ({ ...x, address: checksumAddress(x.address) }))
    .filter((x) => x.address) as TokenInfo[]

  return keyBy(lists, (x) => `${x.chainId}-${x.address}`)
}

export const queryTokenList = cacheByLRU(_queryTokenList, getHomeCacheSettings('token-map'))
