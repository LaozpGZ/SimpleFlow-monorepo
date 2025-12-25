/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
import { Injectable, Logger } from '@nestjs/common';
import { ChainId } from '@pancakeswap/chains';
import { RpcService } from '@/common/rpc/rpc.service';

export interface RpcStatus {
  chainId: number;
  chainName: string;
  status: 'ok' | 'error';
  blockNumber?: string; // BigInt 转换为字符串
  error?: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  // 链名称映射
  private readonly chainNames: Record<number, string> = {
    [ChainId.ETHEREUM]: 'Ethereum',
    [ChainId.BSC]: 'BSC',
    [ChainId.BSC_TESTNET]: 'BSC Testnet',
    [ChainId.ZKSYNC]: 'zkSync Era',
    [ChainId.ARBITRUM_ONE]: 'Arbitrum One',
    [ChainId.OPBNB]: 'opBNB',
    [ChainId.BASE]: 'Base',
    [ChainId.LINEA]: 'Linea',
    [ChainId.SIMPLECHAIN]: 'SimpleChain',
  };

  constructor(private rpcService: RpcService) {}

  async check() {
    const startTime = Date.now();

    // 并行检查所有 RPC 连接
    const rpcStatuses = await this.checkRpcConnections();

    // 计算整体状态
    const allOk = rpcStatuses.every((r) => r.status === 'ok');

    return {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      memory: process.memoryUsage(),
      rpc: rpcStatuses,
    };
  }

  /**
   * 检查所有 RPC 连接状态
   */
  private async checkRpcConnections(): Promise<RpcStatus[]> {
    const chains = Object.keys(this.chainNames).map(Number);

    // 并行检查所有链
    const results = await Promise.allSettled(
      chains.map((chainId) => this.checkSingleRpc(chainId)),
    );

    return results.map((result, index) => {
      const chainId = chains[index];

      if (result.status === 'fulfilled') {
        return result.value;
      }

      return {
        chainId,
        chainName: this.chainNames[chainId] || `Chain ${chainId}`,
        status: 'error',
        error: result.reason?.message || 'Unknown error',
      };
    });
  }

  /**
   * 检查单个 RPC 连接
   */
  private async checkSingleRpc(chainId: number): Promise<RpcStatus> {
    const client = this.rpcService.getClient(chainId as ChainId);

    if (!client) {
      return {
        chainId,
        chainName: this.chainNames[chainId] || `Chain ${chainId}`,
        status: 'error',
        error: 'RPC client not initialized',
      };
    }

    try {
      // 获取最新区块号来验证连接
      const blockNumber = await client.getBlockNumber();

      return {
        chainId,
        chainName: this.chainNames[chainId] || `Chain ${chainId}`,
        status: 'ok',
        blockNumber: blockNumber.toString(), // 转换为字符串以便 JSON 序列化
      };
    } catch (error) {
      this.logger.error(`RPC check failed for chain ${chainId}:`, error);

      return {
        chainId,
        chainName: this.chainNames[chainId] || `Chain ${chainId}`,
        status: 'error',
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }
}
