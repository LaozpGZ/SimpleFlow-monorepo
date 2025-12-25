/**
 * 测试脚本
 */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */

import { ChainId } from '@pancakeswap/chains';
import { DEPLOYER_ADDRESSES, FeeAmount, pancakeV3PoolABI } from '@pancakeswap/v3-sdk';
import { computeV3PoolAddress } from '@pancakeswap/v3-sdk';
import { erc20Abi, createPublicClient, http } from 'viem';

// 热门代币对（使用正确的BSC地址）
const HOT_TOKEN_PAIRS: [string, string][] = [
  ['0x55d398326f99059fF757531eD4Ac495801529006', '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'], // USDT/WBNB
  ['0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'], // USDC/WBNB
  ['0x55d398326f99059fF757531eD4Ac495801529006', '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'], // USDT/USDC
  ['0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'], // CAKE/WBNB
];

// BSC RPC
const BSC_RPC = 'https://bsc-dataseed1.binance.org';

async function testV3PoolsOnChain() {
  console.log('开始测试从链上获取 V3 池子数据...\n');

  const client = createPublicClient({
    transport: http(BSC_RPC),
  });

  const deployerAddress = DEPLOYER_ADDRESSES[ChainId.BSC];
  console.log('V3 Deployer:', deployerAddress);

  const fees = [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];
  const poolsFound: any[] = [];

  // 首先获取 TVL 参考
  console.log('\n=== 获取 TVL 参考 ===');
  try {
    const response = await fetch('https://routing-api.pancakeswap.com/v0/v3-pools-tvl/56');
    const tvlData: { address: string; tvlUSD: string }[] = await response.json();
    console.log(`✓ 获取到 ${tvlData.length} 个池子的 TVL 数据`);
  } catch (e) {
    console.log('✗ 获取 TVL 数据失败:', e);
  }

  // 获取池子数据
  console.log('\n=== 获取链上池子数据 ===');
  for (const [tokenA, tokenB] of HOT_TOKEN_PAIRS) {
    for (const fee of fees) {
      try {
        const poolAddress = computeV3PoolAddress({
          deployerAddress,
          tokenA: tokenA as `0x${string}`,
          tokenB: tokenB as `0x${string}`,
          fee,
        });

        const [liquidity, slot0, symbol0, symbol1] = await client.multicall({
          contracts: [
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
            {
              address: tokenA,
              abi: erc20Abi,
              functionName: 'symbol',
            },
            {
              address: tokenB,
              abi: erc20Abi,
              functionName: 'symbol',
            },
          ],
          allowFailure: true,
        });

        if (liquidity.result && liquidity.result > 0n) {
          console.log(`✓ 池子 ${symbol0.result}/${symbol1.result} (${fee / 10000}%):`);
          console.log(`  地址: ${poolAddress}`);
          console.log(`  Liquidity: ${liquidity.result.toString()}`);
          console.log(`  Tick: ${slot0.result?.[1]}`);
          console.log(`  SqrtPrice: ${slot0.result?.[0]?.toString().slice(0, 20)}...`);
          poolsFound.push({
            address: poolAddress,
            token0: symbol0.result,
            token1: symbol1.result,
            fee: fee / 10000,
            liquidity: liquidity.result.toString(),
          });
        }
      } catch (e) {
        // 忽略不存在的池子
      }
    }
  }

  console.log(`\n总共找到 ${poolsFound.length} 个活跃的 V3 池子`);
}

testV3PoolsOnChain().catch(console.error);
