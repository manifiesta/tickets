import { Module } from '@nestjs/common';
import { SellersModule } from './sellers/sellers.module';

@Module({
  imports: [SellersModule]
})
export class ApiModule {}
