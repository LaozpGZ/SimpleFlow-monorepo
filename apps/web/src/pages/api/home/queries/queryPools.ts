import { ChainId } from '@pancakeswap/chains'
import { ZERO_ADDRESS } from '@pancakeswap/swap-sdk-core'
import keyBy from 'lodash/keyBy'
import { fetchExplorerFarmPools } from 'state/farmsV4/state/farmPools/fetcher'
import { checksumAddress } from 'utils/checksumAddress'
import { HomePagePairConfig, HomePagePoolInfo } from '../types'

function poolId(chainId: ChainId, id: string) {
  return `${chainId}:${id}`
}

const pairsConfig: HomePagePairConfig[] = [
  {
    id: '0x172fcD41E0913e95784454622d1c3724f546f849',
    chainId: ChainId.BSC,
  },
  {
    id: '0x36696169C63e42cd08ce11f5deeBbCeBae652050',
    chainId: ChainId.BSC,
  },
  {
    id: '0xD0e226f674bBf064f54aB47F42473fF80DB98CBA',
    chainId: ChainId.BSC,
  },
]

function tokenLogo(address: `0x${string}`) {
  if (address === ZERO_ADDRESS) {
    return `https://assets.pancakeswap.finance/web/native/${ChainId.BSC}.png`
  }
  return `https://tokens.pancakeswap.finance/images/${address}.png`
}

export async function queryPools() {
  const poolsInfo = await fetchExplorerFarmPools()
  const byIds = keyBy(poolsInfo, (x) => poolId(x.chainId, x.lpAddress.toLowerCase()))
  const pairs = pairsConfig.map((x) => {
    const related = byIds[poolId(x.chainId, x.id.toLowerCase())]
    if (!related) {
      throw new Error(`Pool not found for ${x.id}`)
    }
    return {
      id: checksumAddress(related.lpAddress),
      token0: {
        id: related.token0.wrapped.address,
        symbol: related.token0.wrapped.symbol,
        chainId: related.chainId,
        icon: tokenLogo(related.token0.isNative ? ZERO_ADDRESS : related.token0.wrapped.address),
      },
      token1: {
        id: related.token1.wrapped.address,
        symbol: related.token0.wrapped.symbol,
        chainId: related.chainId,
        icon: tokenLogo(related.token1.isNative ? ZERO_ADDRESS : related.token1.wrapped.address),
      },
      chainId: related.chainId,
      apr24h: Number(related.lpApr),
    } as HomePagePoolInfo
  })
  return pairs
}
