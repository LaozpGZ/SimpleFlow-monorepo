import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RoutingService } from './routing.service';
import { QuoteRequestDto } from './dto/quote-request.dto';

@Controller('routing')
export class RoutingController {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly routingService: RoutingService) {}

  // 对应 CF Workers: GET /v0/quote
  @Get('quote')
  async getQuote(@Query() query: any) {
    return this.routingService.getQuote(query);
  }

  // 对应 CF Workers: POST /v0/quote
  @Post('quote')
  async postQuote(@Body() body: QuoteRequestDto) {
    return this.routingService.getQuote(body);
  }

  // 对应 CF Workers: GET /pools
  @Get('pools')
  async getPools(@Query('chainId') chainId: string) {
    const chainIdNum = parseInt(chainId);
    if (Number.isNaN(chainIdNum)) {
      throw new HttpException('Invalid chainId', HttpStatus.BAD_REQUEST);
    }
    return this.routingService.getPools(chainIdNum);
  }
}
