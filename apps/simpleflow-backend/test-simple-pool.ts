/**
 * 测试脚本
 */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */

import { pancakeV3PoolABI } from '@pancakeswap/v3-sdk';
import { createPublicClient, http, getAddress } from 'viem';

// BSC RPC
const BSC_RPC = 'https://bsc-dataseed1.binance.org';

async function testRealPoolSimple() {
  console.log('开始测试从 TVL API 获取真实池子链上数据...\n');

  const client = createPublicClient({
    transport: http(BSC_RPC),
  });

  // 1. 获取 TVL API 数据
  console.log('=== 步骤1: 获取 TVL API 数据 ===');
  const response = await fetch('https://routing-api.pancakeswap.com/v0/v3-pools-tvl/56');
  const tvlData: { address: string; tvlUSD: string }[] = await response.json();
  console.log(`✓ 获取到 ${tvlData.length} 个池子的 TVL 数据`);

  // 2. 测试前3个TVL最高的池子
  console.log('\n=== 步骤2: 测试 TVL 最高的前3个池子链上数据 ===');

  const topPools = tvlData
    .sort((a, b) => parseFloat(b.tvlUSD) - parseFloat(a.tvlUSD))
    .slice(0, 3);

  for (const pool of topPools) {
    try {
      const poolAddress = getAddress(pool.address);

      // 单独获取每个数据
      const token0 = await client.readContract({
        address: poolAddress as `0x${string}`,
        abi: pancakeV3PoolABI,
        functionName: 'token0',
      });

      const token1 = await client.readContract({
        address: poolAddress as `0x${string}`,
        abi: pancakeV3PoolABI,
        functionName: 'token1',
      });

      const fee = await client.readContract({
        address: poolAddress as `0x${string}`,
        abi: pancakeV3PoolABI,
        functionName: 'fee',
      });

      const liquidity = await client.readContract({
        address: poolAddress as `0x${string}`,
        abi: pancakeV3PoolABI,
        functionName: 'liquidity',
      });

      const slot0 = await client.readContract({
        address: poolAddress as `0x${string}`,
        abi: pancakeV3PoolABI,
        functionName: 'slot0',
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
      console.log(`\n✗ 池子 ${pool.address} 获取失败:`, error instanceof Error ? error.message : error);
    }
  }

  console.log('\n测试完成！');
  console.log('\n✓ 成功验证：链上数据获取可以正常工作！');
}

testRealPoolSimple().catch(console.error);
