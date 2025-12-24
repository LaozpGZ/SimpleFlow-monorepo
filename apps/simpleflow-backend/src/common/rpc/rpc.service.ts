import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, http } from 'viem';
import { mainnet, bsc } from 'viem/chains';
import { ChainId } from '@pancakeswap/chains';

// 简化类型定义，避免 TypeScript 类型实例化过深
type PublicClient = any;

@Injectable()
export class RpcService implements OnModuleInit {
  private readonly logger = new Logger(RpcService.name);

  private clients: Map<ChainId, PublicClient> = new Map();

  // eslint-disable-next-line no-useless-constructor
  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.logger.log('Initializing RPC clients...');

    // Ethereum
    this.clients.set(
      ChainId.ETHEREUM,
      createPublicClient({
        chain: mainnet,
        transport: http(this.configService.get<string>('app.rpc.eth')),
      }),
    );

    // BSC
    this.clients.set(
      ChainId.BSC,
      createPublicClient({
        chain: bsc,
        transport: http(this.configService.get<string>('app.rpc.bsc')),
      }),
    );

    // BSC Testnet
    this.clients.set(
      ChainId.BSC_TESTNET,
      createPublicClient({
        chain: bsc,
        transport: http(this.configService.get<string>('app.rpc.bscTestnet')),
      }),
    );

    // SimpleChain
    this.clients.set(
      ChainId.SIMPLECHAIN,
      createPublicClient({
        chain: {
          id: 8802,
          name: 'SimpleChain',
          nativeCurrency: { name: 'SimpleCoin', symbol: 'SIM', decimals: 18 },
          rpcUrls: {
            default: {
              http: [this.configService.get<string>('app.rpc.simplechain')!],
            },
          },
        },
        transport: http(this.configService.get<string>('app.rpc.simplechain')),
      }),
    );

    this.logger.log(`RPC clients initialized for ${this.clients.size} chains`);
  }

  getClient(chainId: ChainId): PublicClient | undefined {
    return this.clients.get(chainId);
  }

  // SmartRouter 兼容的 OnChainProvider
  getOnChainProvider() {
    return ({ chainId }: { chainId?: ChainId }) => {
      const client = this.clients.get(chainId || ChainId.BSC);
      if (!client) {
        throw new Error(`No RPC client for chainId: ${chainId}`);
      }
      return client;
    };
  }
}
