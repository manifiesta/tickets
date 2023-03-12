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

  @Post('/confirm')
  confirmOrder(@Body() confirmTickets: ConfirmTicketsDto) {
    return this.ticketsService.confirmOrder(confirmTickets);
  }

  @Get('/transaction/:id')
  getTransactionById(@Param('id') id: string) {
    return this.ticketsService.getTransactionById(id);
  }

  @Get('/sellingInformation/seller/top-ten')
  getAllSellerSellingInformationTopTen() {
    return this.ticketsService.getTopTenSeller();
  }

  @Get('/sellingInformation/seller/:id')
  getSellerSellingInformation(@Param('id') id: string) {
    return this.ticketsService.getSellerSellingInformation(id);
  }

  @Get('/sellingInformation/department/top-ten/:id/:postCode')
  getOneDepartmentSellingInformationTopTen(@Param('id') id: string, @Param('postCode') postCode: string) {
    return this.ticketsService.getMyDepartmentTopTen(id, postCode);
  }

  @Get('/sellingInformation/postCode/:postCode/:departmentCode/:fromWorkGroup')
  getOnePostCodeSellingInformation(
    @Param('postCode') postCode: string, @Param('departmentCode') departmentCode: string,  @Param('fromWorkGroup') fromWorkGroup: string
  ) {
    return this.ticketsService.getOnePostCodeSellingInformation(postCode, departmentCode, fromWorkGroup);
  }

  @Post('/newsletter-add')
  newsletterAddMember(@Body() newsletterAdd: NewsletterAddDto) {
    return this.ticketsService.newsletterAddMember(newsletterAdd);
  }
  
}
