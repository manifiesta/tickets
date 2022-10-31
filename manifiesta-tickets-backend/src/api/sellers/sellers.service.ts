import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSellerDto } from './dto/create-seller.dto';
import { Seller } from './seller.entity';

@Injectable()
export class SellersService {

  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) { }

  findAll(): Promise<Seller[]> {
    return this.sellerRepository.find();
  }

  createOne(createSeller: CreateSellerDto) {
    return this.sellerRepository.save(this.sellerRepository.create(createSeller));
  }

}
