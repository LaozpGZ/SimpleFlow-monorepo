/**
 */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
 * 测试池子数据获取
 */
import { PoolsService } from './src/modules/pools/pools.service';
import { CacheService } from './src/common/cache/cache.service';
import { RpcService } from './src/common/rpc/rpc.service';

async function testPools() {
  console.log('开始测试池子数据获取...');

  // 手动创建服务实例
  const cacheService = new CacheService();
  const rpcService = new RpcService();
  const poolsService = new PoolsService(cacheService, rpcService);

  // 初始化
  await poolsService.onModuleInit();

  // 测试支持的链
  const chains = poolsService.getSupportedChains();
  console.log('支持的链:', chains);

  // 测试获取 BSC 链的池子数据
  console.log('\n开始获取 BSC (ChainId 56) 的池子数据...');
  const bscPools = await poolsService.getPools(56, { limit: 10 });
  console.log(`BSC 池子数量: ${bscPools.pools.length}`);
  console.log('前 3 个池子:', JSON.stringify(bscPools.pools.slice(0, 3), null, 2));

  // 测试获取 V3 池子
  console.log('\n开始获取 BSC V3 池子...');
  const v3Pools = await poolsService.getV3Pools(56, 10);
  console.log(`V3 池子数量: ${v3Pools.length}`);
  if (v3Pools.length > 0) {
    console.log('第一个 V3 池子:', JSON.stringify(v3Pools[0], null, 2));
  }

  // 测试获取 V2 池子
  console.log('\n开始获取 BSC V2 池子...');
  const v2Pools = await poolsService.getV2Pools(56, 10);
  console.log(`V2 池子数量: ${v2Pools.length}`);
  if (v2Pools.length > 0) {
    console.log('第一个 V2 池子:', JSON.stringify(v2Pools[0], null, 2));
  }

  // 测试获取 Stable 池子
  console.log('\n开始获取 BSC Stable 池子...');
  const stablePools = await poolsService.getStablePools(56);
  console.log(`Stable 池子数量: ${stablePools.length}`);
  if (stablePools.length > 0) {
    console.log('第一个 Stable 池子:', JSON.stringify(stablePools[0], null, 2));
  }

  console.log('\n测试完成！');
}

testPools().catch(console.error);
