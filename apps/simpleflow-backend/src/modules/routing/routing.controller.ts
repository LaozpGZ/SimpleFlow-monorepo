/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
/* eslint-disable no-await-in-loop */
import {
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { RoutingService } from './routing.service';

@Controller('routing')
export class RoutingController {
  constructor(private readonly routingService: RoutingService) {}

  // 获取最佳报价（GET 方法）
  @Get('quote')
  async getQuote(@Query() query: any) {
    try {
      return await this.routingService.getQuote({
        amount: query.amount,
        chainId: parseInt(query.chainId, 10),
        currency: query.currency,
        tradeType: query.tradeType || 'EXACT_INPUT',
        gasPriceWei: query.gasPriceWei,
        maxHops: query.maxHops ? parseInt(query.maxHops, 10) : 3,
        maxSplits: query.maxSplits ? parseInt(query.maxSplits, 10) : 2,
        poolTypes: query.poolTypes,
      });
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Quote failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 获取最佳报价（POST 方法）
  @Post('quote')
  async getQuotePost(@Body() body: any) {
    try {
      return await this.routingService.getQuote(body);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Quote failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 获取池子列表
  @Get('pools/:chainId')
  async getPools(@Param('chainId') chainId: string) {
    const chainIdNum = parseInt(chainId, 10);
    if (Number.isNaN(chainIdNum)) {
      throw new HttpException('Invalid chainId', HttpStatus.BAD_REQUEST);
    }
    return this.routingService.getPools(chainIdNum);
  }
}
