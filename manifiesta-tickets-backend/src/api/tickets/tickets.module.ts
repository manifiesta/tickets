import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';

@Module({
  providers: [TicketsService],
  controllers: [TicketsController]
})
export class TicketsModule {}
