/**
 */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
 * 测试 V2 池子链上数据获取 - 简化版
 */
import { ChainId } from '@pancakeswap/chains';
import { getAddress, createPublicClient, http, defineChain } from 'viem';

// 简化的 PancakePair ABI
const pancakePairABI = [
  {
    inputs: [],
    name: 'token0',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token1',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getReserves',
    outputs: [
      { internalType: 'uint112', name: 'reserve0', type: 'uint112' },
      { internalType: 'uint112', name: 'reserve1', type: 'uint112' },
      { internalType: 'uint32', name: 'blockTimestampLast', type: 'uint32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// 热门代币对（BSC）
const HOT_TOKEN_PAIRS: [string, string][] = [
  ['0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'], // USDC/WBNB
  ['0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'], // CAKE/WBNB
  ['0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'], // USDC/CAKE
  ['0x55d398326f99059fF757531eD4Ac495801529006', '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'], // USDT/WBNB
  ['0x55d398326f99059fF757531eD4Ac495801529006', '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'], // USDT/USDC
  ['0x2170Ed0880ac9A755fd29B2688956BD959F933F8', '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'], // ETH/WBNB
  ['0x1AF3F329e8BE154074D8769D1FFa4eE058B15DB0', '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'], // BTCB/WBNB
];

// PancakeSwap V2 Factory BSC 地址
const PANCAKE_V2_FACTORY_BSC = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73';

async function testV2PoolsOnChain() {
  console.log('开始测试 V2 池子链上数据获取...\n');

  // 1. 初始化 viem client
  console.log('=== 步骤1: 初始化 viem client ===');
  const chainConfig = defineChain({
    id: 56,
    name: 'BNB Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://bsc-dataseed1.binance.org'] },
    },
  });

  const client = createPublicClient({
    chain: chainConfig,
    transport: http(),
  });
  console.log('✓ 初始化完成\n');

  // 2. 从 Factory 获取池子地址并获取数据
  console.log('=== 步骤2: 从 Factory 获取池子地址和数据 ===');
  const pools: any[] = [];

  for (const [tokenA, tokenB] of HOT_TOKEN_PAIRS) {
    try {
      // 从 Factory 获取池子地址
      const factoryAbi = [
        {
          inputs: [
            { internalType: 'address', name: 'tokenA', type: 'address' },
            { internalType: 'address', name: 'tokenB', type: 'address' },
          ],
          name: 'getPair',
          outputs: [{ internalType: 'address', name: 'pair', type: 'address' }],
          stateMutability: 'view',
          type: 'function',
        },
      ];

      const poolAddress = await client.readContract({
        address: PANCAKE_V2_FACTORY_BSC as `0x${string}`,
        abi: factoryAbi,
        functionName: 'getPair',
        args: [tokenA as `0x${string}`, tokenB as `0x${string}`],
      });

      if ((poolAddress as string).toLowerCase() === '0x0000000000000000000000000000000000000000') {
        console.log(`  ✗ 池子不存在: ${tokenA.slice(0, 10)}.../${tokenB.slice(0, 10)}...`);
        continue;
      }

      console.log(`  ✓ 找到池子: ${poolAddress}`);

      // 获取池子数据
      const [token0, token1, reserves] = await Promise.all([
        client.readContract({
          address: poolAddress as `0x${string}`,
          abi: pancakePairABI,
          functionName: 'token0',
        }),
        client.readContract({
          address: poolAddress as `0x${string}`,
          abi: pancakePairABI,
          functionName: 'token1',
        }),
        client.readContract({
          address: poolAddress as `0x${string}`,
          abi: pancakePairABI,
          functionName: 'getReserves',
        }),
      ]);

      // reserves 返回 [reserve0, reserve1, blockTimestampLast]
      const reserve0 = (reserves as readonly [bigint, bigint, number])[0];
      const reserve1 = (reserves as readonly [bigint, bigint, number])[1];

      pools.push({
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
        reserve0: reserve0.toString(),
        reserve1: reserve1.toString(),
        poolType: 'v2' as const,
        tvlUsd: '0',
      });

      console.log(`    Token0: ${token0}`);
      console.log(`    Token1: ${token1}`);
      console.log(`    Reserve0: ${reserve0.toString()}`);
      console.log(`    Reserve1: ${reserve1.toString()}`);
    } catch (error) {
      console.error(`  ✗ 获取失败:`, error instanceof Error ? error.message.slice(0, 100) : error);
    }
  }

  console.log(`\n✓ 成功获取 ${pools.length} 个 V2 池子\n`);

  // 3. 输出结果
  if (pools.length > 0) {
    console.log('=== 步骤3: 输出结果 ===');
    pools.forEach((pool, i) => {
      console.log(`${i + 1}. ${pool.address}`);
      console.log(`   Token0: ${pool.token0.address}`);
      console.log(`   Token1: ${pool.token1.address}`);
      console.log(`   Reserve0: ${pool.reserve0}`);
      console.log(`   Reserve1: ${pool.reserve1}`);
      console.log('');
    });
  }

  console.log('✓ V2 池子测试完成！');
}

testV2PoolsOnChain().catch(console.error);
