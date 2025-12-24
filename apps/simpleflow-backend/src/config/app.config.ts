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
    eth: process.env.ETH_NODE || 'https://eth.llamarpc.com',
    bsc: process.env.BSC_NODE || 'https://bsc-dataseed.binance.org',
    bscTestnet:
      process.env.BSC_TESTNET_NODE ||
      'https://data-seed-prebsc-1-s1.binance.org:8545',
    simplechain: process.env.SIMPLECHAIN_NODE || 'https://rpc.simplechain.com',
  },
}));
