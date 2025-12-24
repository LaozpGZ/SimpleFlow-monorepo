import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FarmsService } from './farms.service';

@Controller('farms')
export class FarmsController {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly farmsService: FarmsService) {}

  // 对应 CF Workers: GET /:chainId
  @Get(':chainId')
  async getFarms(@Param('chainId') chainId: string) {
    const chainIdNum = parseInt(chainId);
    if (Number.isNaN(chainIdNum)) {
      throw new HttpException('Invalid chainId', HttpStatus.BAD_REQUEST);
    }
    return this.farmsService.getFarms(chainIdNum);
  }

  // 对应 CF Workers: GET /price/cake
  @Get('price/cake')
  async getCakePrice() {
    return this.farmsService.getCakePrice();
  }

  // 对应 CF Workers: GET /v3/:chainId/liquidity/:address
  @Get('v3/:chainId/liquidity/:address')
  async getV3Liquidity(
    @Param('chainId') chainId: string,
    @Param('address') address: string,
  ) {
    const chainIdNum = parseInt(chainId);
    if (Number.isNaN(chainIdNum)) {
      throw new HttpException('Invalid chainId', HttpStatus.BAD_REQUEST);
    }
    return this.farmsService.getV3Liquidity(chainIdNum, address);
  }
}
