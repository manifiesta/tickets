import { Controller, Get } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('api/tickets')
export class TicketsController {

  constructor(private readonly ticketsService: TicketsService) { }
  
  @Get('/types')
  findAll() {
    return this.ticketsService.getAllTicketTypes();
  }
  
}
