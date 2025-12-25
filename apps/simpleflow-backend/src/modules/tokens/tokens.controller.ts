/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
/* eslint-disable no-await-in-loop */
import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  // 获取默认 token list
  @Get('list/default')
  async getDefaultList() {
    return this.tokensService.getTokenList('default');
  }

  // 获取扩展 token list
  @Get('list/extended')
  async getExtendedList() {
    return this.tokensService.getTokenList('extended');
  }

  // 获取指定链的代币
  @Get(':chainId')
  async getTokensByChain(@Param('chainId') chainId: string) {
    const chainIdNum = parseInt(chainId);
    if (Number.isNaN(chainIdNum)) {
      throw new HttpException('Invalid chainId', HttpStatus.BAD_REQUEST);
    }
    return this.tokensService.getTokensByChain(chainIdNum);
  }

  // 搜索代币
  @Get('search/:query')
  async searchTokens(@Param('query') query: string) {
    return this.tokensService.searchTokens(query);
  }
}
