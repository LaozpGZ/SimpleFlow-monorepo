import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PoolsService } from './pools.service';
import { PoolQueryDto, PoolAddressDto } from './dto/pool-query.dto';

/**
 * Pools API 控制器
 * 提供交易池数据查询接口
 */
@Controller('pools')
export class PoolsController {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly poolsService: PoolsService) {}

  /**
   * 获取指定链的所有池子数据
   * GET /pools/:chainId
   */
  @Get(':chainId')
  async getPools(@Param() params: PoolQueryDto) {
    const { chainId } = params;

    // 验证 chainId
    if (Number.isNaN(chainId) || chainId <= 0) {
      throw new HttpException('Invalid chainId', HttpStatus.BAD_REQUEST);
    }

    return this.poolsService.getPools(chainId);
  }

  /**
   * 获取 V3 池子
   * GET /pools/:chainId/v3
   */
  @Get(':chainId/v3')
  async getV3Pools(@Param() params: PoolQueryDto) {
    const { chainId } = params;

    if (Number.isNaN(chainId) || chainId <= 0) {
      throw new HttpException('Invalid chainId', HttpStatus.BAD_REQUEST);
    }

    const v3Pools = await this.poolsService.getV3Pools(chainId);

    return {
      chainId,
      pools: v3Pools,
      _cache: {
        maxAge: 600,
      },
    };
  }

  /**
   * 获取 V2 池子
   * GET /pools/:chainId/v2
   */
  @Get(':chainId/v2')
  async getV2Pools(@Param() params: PoolQueryDto) {
    const { chainId } = params;

    if (Number.isNaN(chainId) || chainId <= 0) {
      throw new HttpException('Invalid chainId', HttpStatus.BAD_REQUEST);
    }

    const v2Pools = await this.poolsService.getV2Pools(chainId);

    return {
      chainId,
      pools: v2Pools,
      _cache: {
        maxAge: 600,
      },
    };
  }

  /**
   * 获取 Stable 池子
   * GET /pools/:chainId/stable
   */
  @Get(':chainId/stable')
  async getStablePools(@Param() params: PoolQueryDto) {
    const { chainId } = params;

    if (Number.isNaN(chainId) || chainId <= 0) {
      throw new HttpException('Invalid chainId', HttpStatus.BAD_REQUEST);
    }

    const stablePools = await this.poolsService.getStablePools(chainId);

    return {
      chainId,
      pools: stablePools,
      _cache: {
        maxAge: 600,
      },
    };
  }

  /**
   * 获取单个池子详情
   * GET /pools/:chainId/:address
   */
  @Get(':chainId/:address')
  async getPoolDetail(@Param() params: PoolAddressDto) {
    const { chainId, address } = params;

    if (Number.isNaN(chainId) || chainId <= 0) {
      throw new HttpException('Invalid chainId', HttpStatus.BAD_REQUEST);
    }

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new HttpException('Invalid pool address', HttpStatus.BAD_REQUEST);
    }

    const pool = await this.poolsService.getPoolDetail(chainId, address);

    if (!pool) {
      throw new HttpException('Pool not found', HttpStatus.NOT_FOUND);
    }

    return pool;
  }
}
