import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getAddress } from 'viem';

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

// 读取源数据
const loadSourceTokens = (type: 'default' | 'extended'): TokenInfo[] => {
  const file = join(process.cwd(), 'tokens', `simpleflow-${type}.json`);
  if (!existsSync(file)) {
    // eslint-disable-next-line no-console
    console.log(`Source file not found: ${file}, using empty list`);
    return [];
  }
  const data = readFileSync(file, 'utf-8');
  return JSON.parse(data);
};

// 校验和格式化地址
const checksumAddresses = (tokens: TokenInfo[]): TokenInfo[] => {
  return tokens.map((token) => ({
    ...token,
    address: getAddress(token.address), // 自动 checksum
  }));
};

// 去重
const deduplicateTokens = (tokens: TokenInfo[]): TokenInfo[] => {
  const seen = new Set<string>();
  return tokens.filter((token) => {
    const key = `${token.chainId}-${token.address.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// 构建 token list
const buildList = async (type: 'default' | 'extended') => {
  const tokens = loadSourceTokens(type);

  // 处理
  const processed = deduplicateTokens(checksumAddresses(tokens));

  const list: TokenList = {
    name: `SimpleFlow ${type === 'default' ? 'Default' : 'Extended'} List`,
    timestamp: new Date().toISOString(),
    version: {
      major: 1,
      minor: 0,
      patch: 0,
    },
    tokens: processed,
    logoURI: 'https://simpleflow.finance/tokens/logos',
  };

  // 输出到 dist
  const distDir = join(process.cwd(), 'dist', 'tokens');
  mkdirSync(distDir, { recursive: true });

  writeFileSync(
    join(distDir, `simpleflow-${type}.json`),
    JSON.stringify(list, null, 2),
  );

  // eslint-disable-next-line no-console
  console.log(`Built ${type} list with ${processed.length} tokens`);
};

// 主函数
const main = async () => {
  await buildList('default');
  await buildList('extended');
  // eslint-disable-next-line no-console
  console.log('Token lists built successfully!');
};

main().catch(console.error);
