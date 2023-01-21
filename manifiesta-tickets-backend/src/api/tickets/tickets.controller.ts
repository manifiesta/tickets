import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConfirmTicketsDto } from './dto/confirm-tickets.dto';
import { NewsletterAddDto } from './dto/newsletter-add.dto';
import { PreparTicketsDto } from './dto/prepar-tickets.dto';
import { TicketsService } from './tickets.service';

@Controller('api/tickets')
export class TicketsController {

  constructor(private readonly ticketsService: TicketsService) { }
  
  @Get(['/types/:shop', '/types'])
  findAll(@Param('shop') shop: string = 'app') {
    return this.ticketsService.getAllTicketTypes(shop);
  }

  @Post('/prepar')
  preparOrder(@Body() preparTickets: PreparTicketsDto) {
    return this.ticketsService.preparOrder(preparTickets);
  }

  // TODO protect with jwt
  @Post('/confirm')
  confirmOrder(@Body() confirmTickets: ConfirmTicketsDto) {
    return this.ticketsService.confirmOrder(confirmTickets);
  }

  @Get('/transaction/:id')
  getTransactionById(@Param('id') id: string) {
    return this.ticketsService.getTransactionById(id);
  }

  @Get('/sellingInformation')
  getAllSellingInformation() {
    return this.ticketsService.getAllSellingInformation();
  }

  @Get('/sellingInformation/seller/:id')
  getSellerSellingInformation(@Param('id') id: string) {
    return this.ticketsService.getSellerSellingInformation(id);
  }

  @Get('/sellingInformation/seller')
  getAllSellerSellingInformation() {
    return this.ticketsService.getAllSellerSellingInformation();
  }

  @Get('/sellingInformation/department')
  getAllDepartmentSellingInformation() {
    return this.ticketsService.getAllDepartmentSellingInformation();
  }

  @Get('/sellingInformation/department/:id')
  getOneDepartmentSellingInformation(@Param('id') id: string) {
    return this.ticketsService.getOneDepartmentSellingInformation(id);
  }

  @Get('/sellingInformation/postCode/:id')
  getOnePostCodeSellingInformation(@Param('id') id: string) {
    return this.ticketsService.getOnePostCodeSellingInformation(id);
  }

  @Get('/physicalTickets')
  getAllPhysicalTickets() {
    return this.ticketsService.getAllPhysicalTickets();
  }

  @Get('/physicalTickets/sendDone/:id')
  physicalTicketSendDone(@Param('id') id: string) {
    return this.ticketsService.physicalTicketSendDone(id);
  }

  @Get('/newsletter-add')
  newsletterAddMember(@Body() newsletterAdd: NewsletterAddDto) {
    return this.ticketsService.newsletterAddMember(newsletterAdd);
  }
  
}
