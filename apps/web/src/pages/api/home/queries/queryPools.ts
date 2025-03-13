import { ChainId, getChainName } from '@pancakeswap/chains'
import { ZERO_ADDRESS } from '@pancakeswap/swap-sdk-core'
import { fetchExplorerFarmPools } from 'state/farmsV4/state/farmPools/fetcher'
import { PoolInfo } from 'state/farmsV4/state/type'
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

function scorePools(
  pools: PoolInfo[],
  weights = {
    tvlUsd: 8,
    apr: 2,
  },
) {
  const liquidityValues = pools.map((p) => Number(p.tvlUsd))
  const aprValues = pools.map((p) => parseFloat(p.lpApr || '0'))

  const minLiquidity = Math.min(...liquidityValues)
  const maxLiquidity = Math.max(...liquidityValues)

  const minApr = Math.min(...aprValues)
  const maxApr = Math.max(...aprValues)

  const normalize = (value: number, min: number, max: number) => (max === min ? 0 : (value - min) / (max - min))

  return pools
    .map((pool) => {
      const liquidityScore = normalize(Number(pool.tvlUsd), minLiquidity, maxLiquidity)
      const aprScore = normalize(Number(pool.lpApr), minApr, maxApr)
      const score = liquidityScore * weights.tvlUsd + aprScore * weights.apr

      return { pool, score }
    })
    .sort((a, b) => b.score - a.score)
}

export async function queryPools() {
  const poolsInfo = await fetchExplorerFarmPools()
  const filtered = poolsInfo.filter((x) => x.lpApr && x.tvlUsd)

  scorePools(filtered)
  const tops = filtered.slice(0, 3)

  return tops.map((p) => {
    const chain = getChainName(p.chainId)
    const link = `/liquidity/pool/${chain}/${p.lpAddress}`
    return {
      id: checksumAddress(p.lpAddress),
      link,
      token0: {
        id: p.token0.wrapped.address,
        symbol: p.token0.wrapped.symbol,
        chainId: p.chainId,
        icon: tokenLogo(p.token0.isNative ? ZERO_ADDRESS : p.token0.wrapped.address),
      },
      token1: {
        id: p.token1.wrapped.address,
        symbol: p.token1.wrapped.symbol,
        chainId: p.chainId,
        icon: tokenLogo(p.token1.isNative ? ZERO_ADDRESS : p.token1.wrapped.address),
      },
      chainId: p.chainId,
      apr24h: Number(p.lpApr),
    } as HomePagePoolInfo
  })
}
