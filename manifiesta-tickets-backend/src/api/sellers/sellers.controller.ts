import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SellersService } from './sellers.service';

@Controller('api/sellers')
export class SellersController {

  constructor(private readonly sellersService: SellersService) { }
  
  @Get()
  findAll() {
    return this.sellersService.findAll();
  }

  // TODO for demo purpose
  @Get('/tickets/:email')
  addTicket(@Param('email') email: string) {
    return this.sellersService.addTicket(email);
  }

}
