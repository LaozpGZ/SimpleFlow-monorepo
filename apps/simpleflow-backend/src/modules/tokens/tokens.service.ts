import { Injectable, Logger } from '@nestjs/common';
import { ChainId } from '@pancakeswap/chains';
import { getTokensByChain } from '@pancakeswap/tokens';

import { CacheService } from '@/common/cache/cache.service';

export interface TokenInfo {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  projectLink?: string;
}

export interface TokenList {
  name: string;
  timestamp: string;
  version: { major: number; minor: number; patch: number };
  tokens: TokenInfo[];
  logoURI: string;
}

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);

  // eslint-disable-next-line no-useless-constructor
  constructor(private cacheService: CacheService) {}

  /**
   * 获取 Token List
   */
  // eslint-disable-next-line class-methods-use-this
  async getTokenList(_type: 'default' | 'extended') {
    // 直接使用 PancakeSwap 的 tokens
    // type 暂时不区分，都返回全部支持的链的 tokens
    const allTokens: TokenInfo[] = [];

    // 支持的链ID
    const supportedChains: ChainId[] = [
      ChainId.ETHEREUM,
      ChainId.BSC,
      ChainId.BSC_TESTNET,
    ];

    for (const chainId of supportedChains) {
      const tokens = getTokensByChain(chainId);
      for (const token of tokens) {
        allTokens.push({
          chainId: token.chainId,
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          projectLink: token.projectLink,
        });
      }
    }

    return {
      name: `PancakeSwap Token List`,
      timestamp: new Date().toISOString(),
      version: { major: 1, minor: 0, patch: 0 },
      tokens: allTokens,
      logoURI: 'https://pancakeswap.finance/tokens/logos',
      _cache: {
        maxAge: 3600, // 1小时
      },
    };
  }

  /**
   * 获取指定链的 Tokens
   */
  async getTokensByChain(chainId: number) {
    const cacheKey = `tokens:chain:${chainId}`;
    const cached = await this.cacheService.get<TokenInfo[]>(cacheKey);
    if (cached) return cached;

    try {
      const tokens = getTokensByChain(chainId as ChainId);

      const tokenInfo: TokenInfo[] = tokens.map((token) => ({
        chainId: token.chainId,
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        projectLink: token.projectLink,
      }));

      await this.cacheService.set(cacheKey, tokenInfo, 3600);
      return tokenInfo;
    } catch (error) {
      this.logger.error(`Failed to get tokens for chain ${chainId}`, error);
      return [];
    }
  }

  /**
   * 搜索 Tokens
   */
  // eslint-disable-next-line class-methods-use-this
  async searchTokens(query: string) {
    const q = query.toLowerCase();
    const allTokens: TokenInfo[] = [];

    // 支持的链ID
    const supportedChains: ChainId[] = [
      ChainId.ETHEREUM,
      ChainId.BSC,
      ChainId.BSC_TESTNET,
    ];

    for (const chainId of supportedChains) {
      const tokens = getTokensByChain(chainId);
      for (const token of tokens) {
        allTokens.push({
          chainId: token.chainId,
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          projectLink: token.projectLink,
        });
      }
    }

    return allTokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q),
    );
  }
}
