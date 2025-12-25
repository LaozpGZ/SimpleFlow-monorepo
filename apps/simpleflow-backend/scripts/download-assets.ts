/**
 * 批量下载常用代币图标
 *
 * 用法: pnpm download:assets
 */

import * as fs from 'fs/promises';
import * as path from 'path';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-loop-func */

/**
 * 常用代币列表
 * 可以根据需要添加更多
 */
const COMMON_TOKENS = [
  // BSC 链
  {
    chainId: 56,
    address: '0x55d398326f99059fF775485246999027B3197955',
    symbol: 'USDT',
  },
  {
    chainId: 56,
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    symbol: 'USDC',
  },
  {
    chainId: 56,
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    symbol: 'BUSD',
  },
  {
    chainId: 56,
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    symbol: 'WBNB',
  },
  {
    chainId: 56,
    address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    symbol: 'CAKE',
  },
  {
    chainId: 56,
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    symbol: 'ETH',
  },
  {
    chainId: 56,
    address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    symbol: 'BTCB',
  },
  {
    chainId: 56,
    address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    symbol: 'DAI',
  },
  {
    chainId: 56,
    address: '0x47BEAd2563d08f095021fA1951907c877079011f',
    symbol: 'TUSD',
  },
  {
    chainId: 56,
    address: '0xfD5840Cd36d94D7229439859C0112a4185BC0255',
    symbol: 'USDD',
  },

  // Ethereum 链
  {
    chainId: 1,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
  },
  {
    chainId: 1,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
  },
  {
    chainId: 1,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
  },
  {
    chainId: 1,
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    symbol: 'WBTC',
  },
  {
    chainId: 1,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
  },

  // Polygon 链
  {
    chainId: 137,
    address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    symbol: 'WMATIC',
  },
  {
    chainId: 137,
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    symbol: 'USDC',
  },
  {
    chainId: 137,
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    symbol: 'USDT',
  },

  // Arbitrum 链
  {
    chainId: 42161,
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    symbol: 'WETH',
  },
  {
    chainId: 42161,
    address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    symbol: 'USDC',
  },
  {
    chainId: 42161,
    address: '0xfd086Bc7cd5C481DCC9c85eBe478A1C0B697Bbd9',
    symbol: 'USDT',
  },

  // Base 链
  {
    chainId: 8453,
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
  },
  {
    chainId: 8453,
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDC',
  },

  // Linea 链
  {
    chainId: 59144,
    address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
    symbol: 'WETH',
  },

  // OPBNB 链
  {
    chainId: 204,
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
  },
];

/**
 * 常用链图标
 */
const COMMON_CHAINS = [1, 56, 137, 250, 42161, 8453, 59144, 204, 324, 10];

/**
 * CDN 源
 */
const PCS_CDN = 'https://tokens.pancakeswap.finance';
const TRUSTWALLET_CDN = 'https://assets-cdn.trustwallet.com';

/**
 * 链ID到TrustWallet路径映射
 */
const CHAIN_TO_TRUSTWALLET: Record<number, string> = {
  1: 'ethereum',
  56: 'smartchain',
  137: 'polygon',
  250: 'fantom',
  42161: 'arbitrum',
  8453: 'base',
  59144: 'linea',
  204: 'optimism',
  324: 'zksync',
  10: 'optimism',
  43114: 'avalanche',
};

/**
 * 下载文件
 */
async function downloadFile(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

/**
 * 获取代币图标（多源尝试）
 */
async function downloadTokenIcon(
  chainId: number,
  address: string,
): Promise<Buffer | null> {
  const addr = address.toLowerCase();

  // 1. PancakeSwap CDN
  let url = `${PCS_CDN}/images/${addr}.png`;
  let icon = await downloadFile(url);
  if (icon) return icon;

  // 2. PancakeSwap CDN (带链ID)
  url = `${PCS_CDN}/images/${chainId}/${addr}.png`;
  icon = await downloadFile(url);
  if (icon) return icon;

  // 3. TrustWallet CDN
  const trustPath = CHAIN_TO_TRUSTWALLET[chainId];
  if (trustPath) {
    url = `${TRUSTWALLET_CDN}/blockchains/${trustPath}/assets/${addr}/logo.png`;
    icon = await downloadFile(url);
    if (icon) return icon;
  }

  return null;
}

/**
 * 获取链图标
 */
async function downloadChainIcon(chainId: number): Promise<Buffer | null> {
  const url = `${PCS_CDN}/web/chains/${chainId}.png`;
  return downloadFile(url);
}

/**
 * 保存文件
 */
async function saveFile(filePath: string, buffer: Buffer): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, buffer);
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始下载常用代币图标...\n');

  const assetsDir = path.join(process.cwd(), 'public/assets');
  let successCount = 0;
  let failCount = 0;

  // 1. 下载代币图标
  console.log('📦 下载代币图标...');
  for (const token of COMMON_TOKENS) {
    process.stdout.write(`  ⏳ ${token.symbol}(${token.chainId})... `);

    const icon = await downloadTokenIcon(token.chainId, token.address);
    if (icon) {
      const filePath = path.join(
        assetsDir,
        'tokens',
        token.chainId.toString(),
        `${token.address.toLowerCase()}.png`,
      );
      await saveFile(filePath, icon);
      successCount++;
      console.log('✅');
    } else {
      failCount++;
      console.log('❌');
    }
  }

  // 2. 下载链图标
  console.log('\n🔗 下载链图标...');
  for (const chainId of COMMON_CHAINS) {
    process.stdout.write(`  ⏳ Chain ${chainId}... `);

    const icon = await downloadChainIcon(chainId);
    if (icon) {
      const filePath = path.join(assetsDir, 'chains', `${chainId}.png`);
      await saveFile(filePath, icon);
      successCount++;
      console.log('✅');
    } else {
      failCount++;
      console.log('❌');
    }
  }

  console.log(`\n✨ 下载完成! 成功: ${successCount}, 失败: ${failCount}`);
}

main().catch(console.error);
