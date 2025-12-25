/**
 * 测试脚本
 */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */

import 'reflect-metadata';

// ⚠️ 重要：装饰器必须在类定义之前定义！
import { Injectable } from '@nestjs/common';

// 测试服务 A
@Injectable()
class ServiceA {
  getName() {
    return 'ServiceA';
  }
}

// 测试服务 B（依赖 ServiceA）
@Injectable()
class ServiceB {
  constructor(private serviceA: ServiceA) {}

  getName() {
    return `ServiceB depends on ${this.serviceA.getName()}`;
  }
}

// 检查元数据
function checkMetadata(className: any, classRef: any) {
  console.log(`\n检查 ${className}:`);
  const paramTypes = Reflect.getMetadata('design:paramtypes', classRef);
  if (paramTypes) {
    console.log(
      '  ✓ 构造函数参数类型:',
      paramTypes.map((t: any) => t?.name || 'any'),
    );
  } else {
    console.log('  ✗ 未找到参数类型元数据！');
  }
}

// 测试路径别名解析
async function testPathAlias() {
  console.log('\n=== 测试路径别名解析 ===');
  try {
    // 尝试导入使用路径别名的模块
    const { PoolsService } = await import('./src/modules/pools/pools.service');
    console.log('✓ 路径别名 @/ 解析成功！');
    console.log('  PoolsService:', PoolsService.name);

    // 检查 PoolsService 的依赖注入元数据
    const paramTypes = Reflect.getMetadata('design:paramtypes', PoolsService);
    if (paramTypes) {
      console.log(
        '  ✓ PoolsService 依赖:',
        paramTypes.map((t: any) => t?.name || 'unknown'),
      );
    } else {
      console.log('  ✗ PoolsService 没有参数类型元数据！');
    }
  } catch (error) {
    console.log('✗ 路径别名解析失败:', error.message);
  }
}

async function main() {
  console.log('=== NestJS + tsx 依赖注入测试 ===');

  // 检查装饰器元数据
  checkMetadata('ServiceA', ServiceA);
  checkMetadata('ServiceB', ServiceB);

  // 创建 ServiceB 实例，测试依赖注入是否工作
  const serviceB = new ServiceB(new ServiceA());
  console.log('\n实例方法调用:', serviceB.getName());

  // 测试路径别名
  await testPathAlias();

  console.log('\n=== 测试完成 ===');
  if (
    Reflect.getMetadata('design:paramtypes', ServiceB) &&
    Reflect.getMetadata('design:paramtypes', PoolsService)
  ) {
    console.log('✓ 所有依赖注入元数据都正确！NestJS 应该可以正常工作！');
  } else {
    console.log('✗ 警告：某些元数据缺失，NestJS 依赖注入可能有问题！');
  }
}

main().catch(console.error);
