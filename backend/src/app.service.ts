import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {version: '0.0.1', name: 'manifiesta-tickets'};
  }
}
