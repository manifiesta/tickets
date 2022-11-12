import { Module } from '@nestjs/common';
import { SellersModule } from './sellers/sellers.module';
import { DepartmentsModule } from './departments/departments.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [SellersModule, DepartmentsModule, TicketsModule]
})
export class ApiModule {}
