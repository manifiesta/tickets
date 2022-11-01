import { Body, Controller, Get, Post } from '@nestjs/common';
import { SellersService } from './sellers.service';

@Controller('api/sellers')
export class SellersController {

  constructor(private readonly sellersService: SellersService) { }
  
  @Get()
  findAll() {
    return this.sellersService.findAll();
  }

  // TODO for demo purpose
  @Get('/tickets')
  addTicket(@Body() add: any) {
    return this.sellersService.addTicket(add.emaill);
  }

}
