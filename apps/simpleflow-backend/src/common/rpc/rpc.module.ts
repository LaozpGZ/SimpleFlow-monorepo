import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RpcService } from './rpc.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RpcService],
  exports: [RpcService],
})
export class RpcModule {}
