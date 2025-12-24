import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

import { CacheService } from '@/common/cache/cache.service';

interface TokenInfo {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

interface TokenList {
  name: string;
  timestamp: string;
  version: { major: number; minor: number; patch: number };
  tokens: TokenInfo[];
  logoURI: string;
}

@Injectable()
export class TokensService implements OnModuleInit {
  private readonly logger = new Logger(TokensService.name);

  private defaultList: TokenList | null = null;

  private extendedList: TokenList | null = null;

  // eslint-disable-next-line no-useless-constructor
  constructor(private cacheService: CacheService) {}

  onModuleInit() {
    this.loadTokenLists();
  }

  // eslint-disable-next-line class-methods-use-this
  private loadTokenLists() {
    const distDir = join(process.cwd(), 'dist', 'tokens');

    try {
      const defaultPath = join(distDir, 'simpleflow-default.json');
      const extendedPath = join(distDir, 'simpleflow-extended.json');

      if (existsSync(defaultPath)) {
        this.defaultList = JSON.parse(readFileSync(defaultPath, 'utf-8'));
        this.logger.log(
          `Loaded default list with ${this.defaultList.tokens.length} tokens`,
        );
      } else {
        this.logger.warn('Default token list not found, using empty list');
        this.defaultList = this.createEmptyList('Default');
      }

      if (existsSync(extendedPath)) {
        this.extendedList = JSON.parse(readFileSync(extendedPath, 'utf-8'));
        this.logger.log(
          `Loaded extended list with ${this.extendedList.tokens.length} tokens`,
        );
      } else {
        this.logger.warn('Extended token list not found, using empty list');
        this.extendedList = this.createEmptyList('Extended');
      }
    } catch (e) {
      this.logger.error('Failed to load token lists', e);
      this.defaultList = this.createEmptyList('Default');
      this.extendedList = this.createEmptyList('Extended');
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private createEmptyList(type: string): TokenList {
    return {
      name: `SimpleFlow ${type} List`,
      timestamp: new Date().toISOString(),
      version: { major: 1, minor: 0, patch: 0 },
      tokens: [],
      logoURI: 'https://simpleflow.finance/tokens/logos',
    };
  }

  async getTokenList(type: 'default' | 'extended') {
    const list = type === 'default' ? this.defaultList : this.extendedList;

    return {
      ...list,
      _cache: {
        maxAge: 3600, // 1小时
      },
    };
  }

  async getTokensByChain(chainId: number) {
    const cacheKey = `tokens:chain:${chainId}`;
    const cached = await this.cacheService.get<TokenInfo[]>(cacheKey);
    if (cached) return cached;

    const tokens: TokenInfo[] = [];

    if (this.defaultList) {
      tokens.push(
        ...this.defaultList.tokens.filter((t) => t.chainId === chainId),
      );
    }
    if (this.extendedList) {
      tokens.push(
        ...this.extendedList.tokens.filter((t) => t.chainId === chainId),
      );
    }

    await this.cacheService.set(cacheKey, tokens, 3600);
    return tokens;
  }

  async searchTokens(query: string) {
    const q = query.toLowerCase();
    const allTokens: TokenInfo[] = [];

    if (this.defaultList) {
      allTokens.push(...this.defaultList.tokens);
    }
    if (this.extendedList) {
      allTokens.push(...this.extendedList.tokens);
    }

    return allTokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q),
    );
  }
}
