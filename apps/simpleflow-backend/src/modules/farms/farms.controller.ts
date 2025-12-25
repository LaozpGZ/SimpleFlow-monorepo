import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';
import { FarmsService } from './farms.service';

/**
 * 农场列表响应
 */
interface FarmsListResponse {
  chainId: number;
  updatedAt: string;
  v2?: {
    poolLength: number;
    regularCakePerBlock: string;
    totalRegularAllocPoint: string;
    totalSpecialAllocPoint: string;
    farms: any[];
  };
}

/**
 * CAKE 价格数据
 */
interface CakePriceData {
  price: string;
  source: string;
  updatedAt: string;
}

/**
 * MasterChef 数据
 */
interface MasterChefData {
  poolLength: number;
  totalRegularAllocPoint: string;
  totalSpecialAllocPoint: string;
  cakePerBlock: string;
  updatedAt: string;
}

/**
 * 支持的链响应
 */
interface SupportedChainsResponse {
  v2: number[];
  v3: number[];
}

/**
 * APR 计算请求
 */
interface CalculateAprRequest {
  poolWeight: string;
  tvlUsd: string;
  cakePriceUsd: string;
  cakePerBlock?: string;
  precision?: number;
}

/**
 * TVL 计算请求
 */
interface CalculateTvlRequest {
  token0Amount: string;
  token0Price: string;
  token1Amount: string;
  token1Price: string;
}

@Controller('farms')
export class FarmsController {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly farmsService: FarmsService) {}

  /**
   * 获取支持的链列表
   * GET /farms/supported-chains
   * 注意：固定路由必须放在动态路由 :chainId 之前！
   */
  @Get('supported-chains')
  getSupportedChains(): SupportedChainsResponse {
    return this.farmsService.getSupportedChains();
  }

  /**
   * 获取 CAKE 价格
   * GET /farms/price/cake
   * 注意：固定路由必须放在动态路由 :chainId 之前！
   */
  @Get('price/cake')
  async getCakePrice(): Promise<CakePriceData> {
    return this.farmsService.getCakePrice();
  }

  /**
   * 检查链是否支持
   * GET /farms/supported/:version/:chainId
   * 注意：固定路由必须放在动态路由 :chainId 之前！
   */
  @Get('supported/:version/:chainId')
  async isChainSupported(
    @Param('version') version: string,
    @Param('chainId') chainId: string,
  ): Promise<{ supported: boolean }> {
    const chainIdNum = parseInt(chainId, 10);
    if (Number.isNaN(chainIdNum)) {
      throw new HttpException('Invalid chainId', HttpStatus.BAD_REQUEST);
    }
    if (version !== 'v2' && version !== 'v3') {
      throw new HttpException(
        'Invalid version, must be v2 or v3',
        HttpStatus.BAD_REQUEST,
      );
    }
    const supported = this.farmsService.isChainSupported(chainIdNum, version);
    return { supported };
  }

  /**
   * 获取 MasterChef 数据
   * GET /farms/masterchef/:chainId
   * 注意：固定路由必须放在动态路由 :chainId 之前！
   */
  @Get('masterchef/:chainId')
  async getMasterChefData(
    @Param('chainId') chainId: string,
  ): Promise<MasterChefData> {
    const chainIdNum = parseInt(chainId, 10);
    if (Number.isNaN(chainIdNum)) {
      throw new HttpException('Invalid chainId', HttpStatus.BAD_REQUEST);
    }
    return this.farmsService.getMasterChefData(chainIdNum);
  }

  /**
   * 计算农场 APR
   * POST /farms/calculate-apr
   */
  @Post('calculate-apr')
  async calculateApr(
    @Body() params: CalculateAprRequest,
  ): Promise<{ apr: string }> {
    try {
      const apr = this.farmsService.calculateFarmApr(params);
      return { apr };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to calculate APR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 计算池子 TVL
   * POST /farms/calculate-tvl
   */
  @Post('calculate-tvl')
  async calculateTvl(
    @Body() params: CalculateTvlRequest,
  ): Promise<{ tvl: string }> {
    try {
      const tvl = this.farmsService.calculateTvl(params);
      return { tvl };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to calculate TVL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取指定链的农场数据
   * GET /farms/:chainId
   * 注意：这个动态路由必须放在最后，作为"兜底"路由
   */
  @Get(':chainId')
  async getFarms(
    @Param('chainId') chainId: string,
  ): Promise<FarmsListResponse> {
    const chainIdNum = parseInt(chainId, 10);
    if (Number.isNaN(chainIdNum)) {
      throw new HttpException('Invalid chainId', HttpStatus.BAD_REQUEST);
    }
    return this.farmsService.getFarms(chainIdNum);
  }
}
