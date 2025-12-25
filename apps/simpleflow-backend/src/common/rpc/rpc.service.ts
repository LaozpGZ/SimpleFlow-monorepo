/* eslint-disable no-useless-constructor */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, http } from 'viem';
import { mainnet, bsc, opBNB, base, arbitrum, linea } from 'viem/chains';
import { ChainId } from '@pancakeswap/chains';

// 简化类型定义，避免 TypeScript 类型实例化过深
type PublicClient = any;

@Injectable()
export class RpcService implements OnModuleInit {
  private readonly logger = new Logger(RpcService.name);

  private clients: Map<ChainId, PublicClient> = new Map();

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

    // opBNB
    const opbnbRpc = this.configService.get<string>('app.rpc.opbnb');
    if (opbnbRpc) {
      this.clients.set(
        ChainId.OPBNB,
        createPublicClient({
          chain: opBNB,
          transport: http(opbnbRpc),
        }),
      );
    }

    // zkSync Era
    const zksyncRpc = this.configService.get<string>('app.rpc.zksync');
    if (zksyncRpc) {
      this.clients.set(
        ChainId.ZKSYNC,
        createPublicClient({
          chain: {
            id: ChainId.ZKSYNC,
            name: 'zkSync Era',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
              default: {
                http: [zksyncRpc],
              },
            },
          },
          transport: http(zksyncRpc),
        }),
      );
    }

    // Base
    const baseRpc = this.configService.get<string>('app.rpc.base');
    if (baseRpc) {
      this.clients.set(
        ChainId.BASE,
        createPublicClient({
          chain: base,
          transport: http(baseRpc),
        }),
      );
    }

    // Arbitrum One
    const arbRpc = this.configService.get<string>('app.rpc.arbitrum');
    if (arbRpc) {
      this.clients.set(
        ChainId.ARBITRUM_ONE,
        createPublicClient({
          chain: arbitrum,
          transport: http(arbRpc),
        }),
      );
    }

    // Linea
    const lineaRpc = this.configService.get<string>('app.rpc.linea');
    if (lineaRpc) {
      this.clients.set(
        ChainId.LINEA,
        createPublicClient({
          chain: linea,
          transport: http(lineaRpc),
        }),
      );
    }

    // SimpleChain
    const simplechainRpc = this.configService.get<string>(
      'app.rpc.simplechain',
    );
    if (simplechainRpc) {
      this.clients.set(
        ChainId.SIMPLECHAIN,
        createPublicClient({
          chain: {
            id: ChainId.SIMPLECHAIN,
            name: 'SimpleChain',
            nativeCurrency: { name: 'SimpleCoin', symbol: 'SIM', decimals: 18 },
            rpcUrls: {
              default: {
                http: [simplechainRpc],
              },
            },
          },
          transport: http(simplechainRpc),
        }),
      );
    }

    // SimpleChain Testnet
    const simplechainTestnetRpc = this.configService.get<string>(
      'app.rpc.simplechainTestnet',
    );
    if (simplechainTestnetRpc) {
      this.clients.set(
        ChainId.SIMPLECHAIN_TESTNET,
        createPublicClient({
          chain: {
            id: ChainId.SIMPLECHAIN_TESTNET,
            name: 'SimpleChain Testnet',
            nativeCurrency: { name: 'SimpleCoin', symbol: 'SIM', decimals: 18 },
            rpcUrls: {
              default: {
                http: [simplechainTestnetRpc],
              },
            },
          },
          transport: http(simplechainTestnetRpc),
        }),
      );
    }

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
