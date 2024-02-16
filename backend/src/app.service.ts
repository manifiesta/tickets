import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  constructor(private httpService: HttpService) {}

  getHello() {
    return {version: '0.0.1', name: 'manifiesta-tickets'};
  }

  bypassCors(url: string) {
    return this.httpService.get(url);
  }
}
