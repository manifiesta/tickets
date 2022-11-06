import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, mergeMap, of } from 'rxjs';
import { Repository } from 'typeorm';
import { ConnectSellerDto } from './dto/connect-seller.dto';
import { CreateSellerDto } from './dto/create-seller.dto';
import { Seller } from './seller.entity';

@Injectable()
export class SellersService {

  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) { }

  findAll(): Promise<Seller[]> {
    return this.sellerRepository.find({
      relations: ['department']
    });
  }

  createOne(createSeller: CreateSellerDto) {
    return this.sellerRepository.save(this.sellerRepository.create(createSeller));
  }

  // TODO Manage error
  // Also say if maybe simple error from the user (good mail but not good department)
  connect(connectSeller: ConnectSellerDto): Promise<Seller> {
    return this.sellerRepository.findOne({
      relations: ['department'],
      where: { email: connectSeller.email, department: connectSeller.department }
    });
  }

  // TODO for demo purpose
  addTicket(email: string) {
    return from(this.sellerRepository.findOne({ where: { email: email } })).pipe(
      mergeMap(seller => {
        seller.sellTickets++;
        return this.sellerRepository.save(seller);
      }),
    );
  }

}
