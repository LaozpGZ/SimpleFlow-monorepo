import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '900', 10),
    maxItems: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  rpc: {
    eth: process.env.ETH_NODE || 'https://1rpc.io/eth',
    bsc: process.env.BSC_NODE || 'https://bsc-dataseed1.binance.org',
    bscTestnet:
      process.env.BSC_TESTNET_NODE ||
      'https://data-seed-prebsc-1-s1.binance.org:8545',
    opbnb: process.env.OPBNB_NODE || 'https://opbnb-mainnet-rpc.bnbchain.org',
    zksync: process.env.ZKSYNC_NODE || 'https://mainnet.era.zksync.io',
    base: process.env.BASE_NODE || 'https://mainnet.base.org',
    arbitrum: process.env.ARBITRUM_NODE || 'https://arb1.arbitrum.io/rpc',
    linea: process.env.LINEA_NODE || 'https://rpc.linea.build',
    simplechain: process.env.SIMPLECHAIN_NODE || 'https://rpc.simplechain.com',
    simplechainTestnet:
      process.env.SIMPLECHAIN_TESTNET_NODE ||
      'https://rpc-testnet.simplechain.com',
  },
  assets: {
    storagePath: process.env.ASSETS_STORAGE_PATH || './public/assets',
    fallbackEnabled: process.env.ASSETS_FALLBACK_ENABLED !== 'false',
    pcsTokenCdnUrl:
      process.env.ASSETS_PCS_TOKEN_CDN_URL ||
      'https://tokens.pancakeswap.finance',
    pcsAssetsCdnUrl:
      process.env.ASSETS_PCS_ASSETS_CDN_URL ||
      'https://assets.pancakeswap.finance',
    trustWalletUrl:
      process.env.ASSETS_TRUSTWALLET_URL ||
      'https://assets-cdn.trustwallet.com',
    iconSize: parseInt(process.env.ASSETS_ICON_SIZE || '128', 10),
  },
}));
