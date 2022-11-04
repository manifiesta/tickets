import { Module } from '@nestjs/common';
import { SellersModule } from './sellers/sellers.module';
import { DepartmentsModule } from './departments/departments.module';

@Module({
  imports: [SellersModule, DepartmentsModule]
})
export class ApiModule {}
