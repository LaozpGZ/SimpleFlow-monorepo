/**
 */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
 * 测试新的 PoolsService
 */
import { PoolsService } from './dist/modules/pools/pools.service';
import { CacheService } from './dist/common/cache/cache.service';
import { RpcService } from './dist/common/rpc/rpc.service';

async function testNewPoolsService() {
  console.log('开始测试新的 PoolsService...\n');

  // 创建服务实例
  const cacheService = new CacheService();
  const rpcService = new RpcService(null, null); // 传入null因为@Optional()装饰器
  const poolsService = new PoolsService(cacheService, rpcService);

  // 初始化
  await poolsService.onModuleInit();

  // 测试1: 获取支持的链
  console.log('=== 测试1: 获取支持的链 ===');
  const chains = poolsService.getSupportedChains();
  console.log(`支持的链数量: ${chains.length}`);
  console.log(`支持的链: ${chains.join(', ')}\n`);

  // 测试2: 获取 BSC V3 池子（从 TVL API + 链上）
  console.log('=== 测试2: 获取 BSC V3 池子（TVL API + 链上数据）===');
  console.log('正在获取前10个TVL最高的池子...');
  try {
    const v3Pools = await poolsService.getV3Pools(56, 10);
    console.log(`✓ 成功获取 ${v3Pools.length} 个 V3 池子\n`);
    if (v3Pools.length > 0) {
      console.log('前3个池子:');
      v3Pools.slice(0, 3).forEach((pool, i) => {
        console.log(`  ${i + 1}. ${pool.address}`);
        console.log(`     Token0: ${pool.token0.address}`);
        console.log(`     Token1: ${pool.token1.address}`);
        console.log(`     Fee: ${pool.fee}%`);
        console.log(`     TVL: $${pool.tvlUsd}`);
        console.log(`     Liquidity: ${pool.liquidity}`);
        console.log(`     Tick: ${pool.tick}\n`);
      });
    }
  } catch (error) {
    console.error('✗ 获取 V3 池子失败:', error);
  }

  // 测试3: 获取 Stable 池子
  console.log('\n=== 测试3: 获取 Stable 池子 ===');
  try {
    const stablePools = await poolsService.getStablePools(56);
    console.log(`✓ 成功获取 ${stablePools.length} 个 Stable 池子\n`);
    if (stablePools.length > 0) {
      console.log('第一个池子:');
      const pool = stablePools[0];
      console.log(`  地址: ${pool.address}`);
      console.log(`  Token0: ${pool.token0.symbol} (${pool.token0.address})`);
      console.log(`  Token1: ${pool.token1.symbol} (${pool.token1.address})`);
    }
  } catch (error) {
    console.error('✗ 获取 Stable 池子失败:', error);
  }

  // 测试4: 获取所有池子
  console.log('\n=== 测试4: 获取所有池子 ===');
  try {
    const result = await poolsService.getPools(56, { limit: 20 });
    console.log(`✓ 成功获取 ${result.pools.length} 个池子 (V3 + V2 + Stable)`);
  } catch (error) {
    console.error('✗ 获取所有池子失败:', error);
  }

  console.log('\n测试完成！');
}

testNewPoolsService().catch(console.error);
