import { Module } from '@nestjs/common';
import { SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seller } from './seller.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Seller]),],
  controllers: [SellersController],
  providers: [SellersService],
  exports: [SellersService]
})
export class SellersModule {}
