/**
 * 测试脚本
 */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */

import { GraphQLClient } from 'graphql-request';
import { ChainId, V3_SUBGRAPHS, V2_SUBGRAPHS } from '@pancakeswap/chains';
import { getStableSwapPools } from '@pancakeswap/stable-swap-sdk';

/**
 * V3 Subgraph 查询
 */
const queryAllV3Pools = `
  query getPools($pageSize: Int!, $id: String) {
    pools(first: $pageSize, where: { id_gt: $id }) {
      id
      tick
      token0 {
        symbol
        id
        decimals
      }
      token1 {
        symbol
        id
        decimals
      }
      sqrtPrice
      feeTier
      liquidity
      totalValueLockedUSD
    }
  }
`;

/**
 * V2 Subgraph 查询
 */
const queryAllV2Pools = `
  query getPairs($pageSize: Int!, $id: String) {
    pairs(first: $pageSize, where: { id_gt: $id }) {
      id
      token0 {
        id
        symbol
        decimals
      }
      token1 {
        id
        symbol
        decimals
      }
      reserve0
      reserve1
      reserveUSD
    }
  }
`;

/**
 * 获取 V3 Subgraph URL
 * 使用正确的格式: https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc
 */
function getV3SubgraphUrl(chainId: number): string | null {
  const subgraphs: Record<number, string> = {
    [ChainId.ETHEREUM]:
      'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-eth',
    [ChainId.BSC]:
      'https://api.thegraph.com/subgraph/name/pancakeswap/exchange-v3-bsc',
    [ChainId.BSC_TESTNET]:
      'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc-testnet',
    [ChainId.ARBITRUM_ONE]:
      'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-arbitrum',
    [ChainId.ZKSYNC]:
      'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-zksync',
    [ChainId.LINEA]:
      'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-linea',
    [ChainId.BASE]:
      'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-base',
    [ChainId.OPBNB]:
      'https://api.studio.thegraph.com/query/46533/exchange-v3-opbnb/version/latest',
  };
  return subgraphs[chainId] || null;
}

/**
 * 获取 V2 Subgraph URL
 */
function getV2SubgraphUrl(chainId: number): string | null {
  // PancakeSwap BSC 不再使用 V2 Subgraph，直接从链上获取
  const subgraphs: Record<number, string> = {
    [ChainId.ETHEREUM]:
      'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v2-eth',
    [ChainId.ZKSYNC]:
      'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v2-zksync',
    [ChainId.ARBITRUM_ONE]:
      'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v2-arbitrum',
    [ChainId.LINEA]:
      'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v2-linea',
    [ChainId.BASE]:
      'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v2-base',
    [ChainId.OPBNB]:
      'https://api.studio.thegraph.com/query/46533/exchange-v2-opbnb/version/latest',
  };
  return subgraphs[chainId] || null;
}

/**
 * 创建 GraphQL 客户端
 */
function createGraphqlClient(url: string): GraphQLClient {
  return new GraphQLClient(url, {
    fetch: (url, options) =>
      fetch(url as string, {
        ...options,
        signal: AbortSignal.timeout(10000),
      }),
  });
}

async function testSubgraph() {
  console.log('开始测试 Subgraph 数据获取...\n');

  // 测试 BSC V3 池子
  console.log('=== 测试 BSC (ChainId 56) V3 池子 ===');
  const v3Url = getV3SubgraphUrl(ChainId.BSC);
  console.log('Subgraph URL:', v3Url);

  if (v3Url) {
    try {
      const client = createGraphqlClient(v3Url);
      const data = await client.request<{
        pools: Array<{
          id: string;
          tick: string;
          sqrtPrice: string;
          feeTier: string;
          liquidity: string;
          totalValueLockedUSD: string;
          token0: {
            id: string;
            symbol: string;
            decimals: string;
          };
          token1: {
            id: string;
            symbol: string;
            decimals: string;
          };
        }>;
      }>(queryAllV3Pools, {
        pageSize: 10,
        id: '',
      });

      console.log(`✓ 成功获取 ${data.pools.length} 个 V3 池子`);
      if (data.pools.length > 0) {
        console.log('第一个池子:');
        const pool = data.pools[0];
        console.log(`  地址: ${pool.id}`);
        console.log(`  交易对: ${pool.token0.symbol}/${pool.token1.symbol}`);
        console.log(`  手续费: ${Number(pool.feeTier) / 10000}%`);
        console.log(`  TVL: $${pool.totalValueLockedUSD}`);
      }
    } catch (error) {
      console.error('✗ 获取 V3 池子失败:', error);
    }
  } else {
    console.log('✗ BSC 没有 V3 Subgraph');
  }

  // 测试 BSC V2 池子
  console.log('\n=== 测试 BSC (ChainId 56) V2 池子 ===');
  const v2Url = getV2SubgraphUrl(ChainId.BSC);
  console.log('V2 Subgraph:', v2Url ? '无 (BSC V2 数据通常从其他来源获取)' : 'N/A');

  // 测试 Ethereum V2 池子
  console.log('\n=== 测试 Ethereum (ChainId 1) V2 池子 ===');
  const ethV2Url = getV2SubgraphUrl(ChainId.ETHEREUM);
  console.log('Subgraph URL:', ethV2Url);

  if (ethV2Url) {
    try {
      const client = createGraphqlClient(ethV2Url);
      const data = await client.request<{
        pairs: Array<{
          id: string;
          reserve0: string;
          reserve1: string;
          reserveUSD: string;
          token0: {
            id: string;
            symbol: string;
            decimals: string;
          };
          token1: {
            id: string;
            symbol: string;
            decimals: string;
          };
        }>;
      }>(queryAllV2Pools, {
        pageSize: 10,
        id: '',
      });

      console.log(`✓ 成功获取 ${data.pairs.length} 个 V2 池子`);
      if (data.pairs.length > 0) {
        console.log('第一个池子:');
        const pair = data.pairs[0];
        console.log(`  地址: ${pair.id}`);
        console.log(`  交易对: ${pair.token0.symbol}/${pair.token1.symbol}`);
        console.log(`  TVL: $${pair.reserveUSD}`);
      }
    } catch (error) {
      console.error('✗ 获取 V2 池子失败:', error);
    }
  }

  // 测试 Stable 池子
  console.log('\n=== 测试 BSC (ChainId 56) Stable 池子 ===');
  try {
    const stablePools = await getStableSwapPools(ChainId.BSC);
    console.log(`✓ 成功获取 ${stablePools.length} 个 Stable 池子`);
    if (stablePools.length > 0) {
      console.log('第一个池子:');
      const pool = stablePools[0];
      console.log(`  LP 地址: ${pool.lpAddress}`);
      console.log(`  交易对: ${pool.token.symbol}/${pool.quoteToken.symbol}`);
    }
  } catch (error) {
    console.error('✗ 获取 Stable 池子失败:', error);
  }

  console.log('\n测试完成！');
}

testSubgraph().catch(console.error);
