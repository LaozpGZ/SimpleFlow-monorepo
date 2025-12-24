import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  // eslint-disable-next-line class-methods-use-this
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
