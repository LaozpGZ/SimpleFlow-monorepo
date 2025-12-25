/**
 * 测试脚本
 */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */

import { pancakeV3PoolABI } from '@pancakeswap/v3-sdk';
import { createPublicClient, http, getAddress, defineChain } from 'viem';

// BSC链配置 - 艹，viem需要完整的chain配置才能用multicall
const bscChain = defineChain({
  id: 56,
  name: 'BNB Smart Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://bsc-dataseed1.binance.org'] },
  },
  multicall: {
    address: '0xcA11bde05977b3631167028862bE2a173976CA11', // 通用multicall3地址
    blockCreated: 15795061,
  },
});

async function testRealPoolFromAPI() {
  console.log('开始测试从 TVL API 获取真实池子地址...\n');

  const client = createPublicClient({
    chain: bscChain,
    transport: http(),
  });

  // 1. 获取 TVL API 数据
  console.log('=== 步骤1: 获取 TVL API 数据 ===');
  const response = await fetch('https://routing-api.pancakeswap.com/v0/v3-pools-tvl/56');
  const tvlData: { address: string; tvlUSD: string }[] = await response.json();
  console.log(`✓ 获取到 ${tvlData.length} 个池子的 TVL 数据`);

  // 2. 获取 TVL 最高的前10个池子的链上数据
  console.log('\n=== 步骤2: 获取 TVL 最高的前10个池子链上数据 ===');

  // 按 TVL 排序，取前10个
  const topPools = tvlData
    .sort((a, b) => parseFloat(b.tvlUSD) - parseFloat(a.tvlUSD))
    .slice(0, 10);

  console.log(`Top 10 池子按 TVL:`);

  for (const pool of topPools) {
    try {
      const poolAddress = getAddress(pool.address);

      // 使用 multicall 获取池子数据
      const [token0, token1, fee, liquidity, slot0] = await client.multicall({
        contracts: [
          {
            address: poolAddress as `0x${string}`,
            abi: pancakeV3PoolABI,
            functionName: 'token0',
          },
          {
            address: poolAddress as `0x${string}`,
            abi: pancakeV3PoolABI,
            functionName: 'token1',
          },
          {
            address: poolAddress as `0x${string}`,
            abi: pancakeV3PoolABI,
            functionName: 'fee',
          },
          {
            address: poolAddress as `0x${string}`,
            abi: pancakeV3PoolABI,
            functionName: 'liquidity',
          },
          {
            address: poolAddress as `0x${string}`,
            abi: pancakeV3PoolABI,
            functionName: 'slot0',
          },
        ],
        allowFailure: false,
      });

      const feePercent = Number(fee) / 10000;
      const tick = slot0[1] as number;
      const sqrtPrice = slot0[0] as bigint;

      console.log(`\n✓ 池子: ${poolAddress}`);
      console.log(`  Token0: ${token0}`);
      console.log(`  Token1: ${token1}`);
      console.log(`  Fee: ${feePercent}%`);
      console.log(`  Liquidity: ${liquidity.toString()}`);
      console.log(`  Tick: ${tick}`);
      console.log(`  TVL: $${pool.tvlUSD}`);
    } catch (error) {
      console.log(`\n✗ 池子 ${pool.address} 获取失败:`, error);
    }
  }

  console.log('\n测试完成！');
}

testRealPoolFromAPI().catch(console.error);
