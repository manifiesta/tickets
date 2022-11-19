import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConfirmTicketsDto } from './dto/confirm-tickets.dto';
import { TicketsService } from './tickets.service';

@Controller('api/tickets')
export class TicketsController {

  constructor(private readonly ticketsService: TicketsService) { }
  
  @Get('/types')
  findAll() {
    return this.ticketsService.getAllTicketTypes();
  }

  // TODO protect with jwt
  @Post('/confirm')
  confirmOrder(@Body() confirmTickets: ConfirmTicketsDto) {
    return this.ticketsService.confirmOrder(confirmTickets);
  }
  
}
