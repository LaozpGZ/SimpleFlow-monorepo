/**
 * 测试脚本
 */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */

import { ChainId } from '@pancakeswap/chains';
import { DEPLOYER_ADDRESSES, FeeAmount, Pool } from '@pancakeswap/v3-sdk';
import { Token } from '@pancakeswap/sdk';
import { getAddress } from 'viem';
import { pancakeV3PoolABI } from '@pancakeswap/v3-sdk';
import { erc20Abi, createPublicClient, http } from 'viem';

// BSC RPC
const BSC_RPC = 'https://bsc-dataseed1.binance.org';

async function testSinglePool() {
  const client = createPublicClient({
    transport: http(BSC_RPC),
  });

  const deployerAddress = DEPLOYER_ADDRESSES[ChainId.BSC];
  console.log('V3 Deployer:', deployerAddress);

  // USDT/WBNB 0.05% pool - 这是一个已知的池子
  // 使用 checksum 地址
  // 正确的 BSC USDT 地址（注意末尾的6）
  const USDT_ADDR = getAddress('0x55d398326f99059fF757531eD4Ac495801529006');
  const WBNB_ADDR = getAddress('0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56');

  const USDT = new Token(ChainId.BSC, USDT_ADDR, 18, 'USDT');
  const WBNB = new Token(ChainId.BSC, WBNB_ADDR, 18, 'WBNB');
  const fee = FeeAmount.LOW; // 500 = 0.05%

  console.log('\n测试获取 USDT/WBNB (0.05%) 池子数据');
  console.log('Token0:', USDT.address, USDT.symbol);
  console.log('Token1:', WBNB.address, WBNB.symbol);

  try {
    const poolAddress = Pool.getAddress(USDT, WBNB, fee);

    console.log('计算出的池子地址:', poolAddress);

    // 单独获取 liquidity
    const liquidity = await client.readContract({
      address: poolAddress as `0x${string}`,
      abi: pancakeV3PoolABI,
      functionName: 'liquidity',
    });

    console.log('Liquidity:', liquidity.toString());

    // 单独获取 slot0
    const slot0 = await client.readContract({
      address: poolAddress as `0x${string}`,
      abi: pancakeV3PoolABI,
      functionName: 'slot0',
    });

    console.log('Slot0:', {
      sqrtPriceX96: slot0[0]?.toString(),
      tick: slot0[1],
    });

    console.log(`池子: ${USDT.symbol}/${WBNB.symbol}`);
    console.log('✓ 成功获取池子数据！');
  } catch (error) {
    console.error('✗ 获取池子数据失败:', error);
  }
}

testSinglePool().catch(console.error);
