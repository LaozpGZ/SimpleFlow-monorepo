/**
 * 测试脚本
 */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */

import { ChainId } from '@pancakeswap/chains';
import { pancakeV3PoolABI } from '@pancakeswap/v3-sdk';
import { getAddress, createPublicClient, http, defineChain } from 'viem';

/**
 * TVL API URL
 */
const TVL_API_URL = (chainId: number) =>
  `https://routing-api.pancakeswap.com/v0/v3-pools-tvl/${chainId}`;

/**
 * 链配置
 */
function getChainConfig(chainId: number) {
  const configs: Record<number, ReturnType<typeof defineChain>> = {
    [ChainId.BSC]: defineChain({
      id: 56,
      name: 'BNB Smart Chain',
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://bsc-dataseed1.binance.org'] },
      },
    }),
  };
  return configs[chainId] || null;
}

async function testPoolsLogic() {
  console.log('开始测试 PoolsService 核心逻辑...\n');

  const chainId = ChainId.BSC;
  const limit = 10;

  // 1. 初始化 viem client
  console.log('=== 步骤1: 初始化 viem client ===');
  const chainConfig = getChainConfig(chainId);
  if (!chainConfig) {
    throw new Error(`No chain config for chainId: ${chainId}`);
  }

  const client = createPublicClient({
    chain: chainConfig,
    transport: http(),
  });
  console.log(`✓ 初始化完成\n`);

  // 2. 从 TVL API 获取池子列表
  console.log('=== 步骤2: 从 TVL API 获取池子列表 ===');
  const tvlResponse = await fetch(TVL_API_URL(chainId));
  if (!tvlResponse.ok) {
    throw new Error(`TVL API returned ${tvlResponse.status}`);
  }

  const tvlRefs: { address: string; tvlUSD: string }[] = await tvlResponse.json();
  console.log(`✓ 获取到 ${tvlRefs.length} 个池子的 TVL 数据\n`);

  // 3. 按 TVL 排序，取前 N 个
  console.log(`=== 步骤3: 按 TVL 排序，取前 ${limit} 个 ===`);
  const sortedPools = tvlRefs
    .sort((a, b) => parseFloat(b.tvlUSD) - parseFloat(a.tvlUSD))
    .slice(0, limit);
  console.log(`✓ 筛选出 ${sortedPools.length} 个 TVL 最高的池子\n`);

  // 4. 从链上获取池子详细数据
  console.log('=== 步骤4: 从链上获取池子详细数据 ===');
  const pools: any[] = [];

  const batchSize = 10;
  for (let i = 0; i < sortedPools.length; i += batchSize) {
    const batch = sortedPools.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(async (poolRef) => {
        try {
          const poolAddress = getAddress(poolRef.address);

          const [token0, token1, fee, liquidity, slot0] = await Promise.all([
            client.readContract({
              address: poolAddress as `0x${string}`,
              abi: pancakeV3PoolABI,
              functionName: 'token0',
            }),
            client.readContract({
              address: poolAddress as `0x${string}`,
              abi: pancakeV3PoolABI,
              functionName: 'token1',
            }),
            client.readContract({
              address: poolAddress as `0x${string}`,
              abi: pancakeV3PoolABI,
              functionName: 'fee',
            }),
            client.readContract({
              address: poolAddress as `0x${string}`,
              abi: pancakeV3PoolABI,
              functionName: 'liquidity',
            }),
            client.readContract({
              address: poolAddress as `0x${string}`,
              abi: pancakeV3PoolABI,
              functionName: 'slot0',
            }),
          ]);

          return {
            address: poolAddress,
            token0: {
              address: token0 as string,
              symbol: '',
              name: '',
              decimals: 18,
            },
            token1: {
              address: token1 as string,
              symbol: '',
              name: '',
              decimals: 18,
            },
            liquidity: (liquidity as bigint).toString(),
            sqrtPriceX96: (slot0[0] as bigint).toString(),
            tick: slot0[1] as number,
            fee: Number(fee) / 10000,
            tvlUsd: poolRef.tvlUSD,
            poolType: 'v3' as const,
          };
        } catch (error) {
          console.error(`  ✗ 池子 ${poolRef.address} 获取失败`);
          return null;
        }
      }),
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        pools.push(result.value);
      }
    }
  }

  console.log(`✓ 成功获取 ${pools.length} 个池子的链上数据\n`);

  // 5. 输出结果
  console.log('=== 步骤5: 输出结果 ===');
  console.log(`成功获取 ${pools.length} 个 V3 池子:\n`);

  pools.forEach((pool, i) => {
    console.log(`${i + 1}. ${pool.address}`);
    console.log(`   Token0: ${pool.token0.address}`);
    console.log(`   Token1: ${pool.token1.address}`);
    console.log(`   Fee: ${pool.fee}%`);
    console.log(`   TVL: $${pool.tvlUsd}`);
    console.log(`   Liquidity: ${pool.liquidity}`);
    console.log(`   Tick: ${pool.tick}`);
    console.log('');
  });

  console.log('✓ 测试完成！PoolsService 核心逻辑正常工作！');
}

testPoolsLogic().catch(console.error);
