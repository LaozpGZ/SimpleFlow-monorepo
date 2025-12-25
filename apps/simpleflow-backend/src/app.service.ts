/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'SimpleFlow Backend API is running!';
  }
}
