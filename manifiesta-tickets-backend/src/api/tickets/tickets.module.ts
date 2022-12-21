import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellingInformation } from './selling-information.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SellingInformation]), HttpModule],
  providers: [TicketsService],
  controllers: [TicketsController]
})
export class TicketsModule {}
