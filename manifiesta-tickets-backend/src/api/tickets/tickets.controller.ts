import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { ConfirmTicketsDto } from './dto/confirm-tickets.dto';
import { NewsletterAddDto } from './dto/newsletter-add.dto';
import { PreparTicketsDto } from './dto/prepar-tickets.dto';
import { TicketsService } from './tickets.service';
import { TicketsGateway } from './tickets.gateway';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DepartmentsService } from '../departments/departments.service';

@Controller('api/tickets')
export class TicketsController {
  vwMerchantId = process.env.VIVA_WALLET_MERCHANT_ID;
  vwApiKey = process.env.VIVA_WALLET_API_KEY;

  constructor(
    private httpService: HttpService,
    private readonly ticketsService: TicketsService,
    private ticketsGateway: TicketsGateway,
    private departmentsService: DepartmentsService
  ) {}

  @Get(['/types/:shop', '/types'])
  findAll(@Param('shop') shop = 'app') {
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
  getOneDepartmentSellingInformationTopTen(
    @Param('id') id: string,
    @Param('postCode') postCode: string,
  ) {
    return this.ticketsService.getMyDepartmentTopTen(id, postCode);
  }

  @Get('/sellingInformation/postCode/:postCode/:departmentCode/:fromWorkGroup')
  getOnePostCodeSellingInformation(
    @Param('postCode') postCode: string,
    @Param('departmentCode') departmentCode: string,
    @Param('fromWorkGroup') fromWorkGroup: string,
  ) {
    return this.ticketsService.getOnePostCodeSellingInformation(
      postCode,
      departmentCode,
      fromWorkGroup,
    );
  }

  @Post('/newsletter-add')
  newsletterAddMember(@Body() newsletterAdd: NewsletterAddDto) {
    return this.ticketsService.newsletterAddMember(newsletterAdd);
  }

  @Post('/seller/qrcode/app')
  getSellerQrCodeApp(@Body() paymentOrder: any) {
    return this.ticketsService.getPayconicQrCode(paymentOrder, true);
  }

  @Post('/seller/qrcode')
  getSellerQrCode(@Body() paymentOrder: any) {
    return this.ticketsService.getPayconicQrCode(paymentOrder, false);
  }

  getWebhookKey() {
    const req = firstValueFrom(
      this.httpService.get<any>(
        `https://www.vivapayments.com/api/messages/config/token`,
        {
          auth: {
            username: this.vwMerchantId,
            password: this.vwApiKey,
          },
        },
      ),
    );
    const promise2 = req
      .then((v) => {
        console.log('val', v.data.Key);
        return v.data;
      })
      .catch((err) => {
        console.log('err', err);
      });

    return promise2;
  }

  @Post('/webhooks/payment/success')
  async receivePaymentFailedWebhook22(@Body() body: any) {
    console.log('SUCCESS', body);

    // Save this in DB for history.
    const notification = {
      status: 'success',
      email: body.EventData?.Email,
      orderCode: body.EventData?.OrderCode,
      statusId: body.EventData?.StatusId,
      transactionId: body.EventData?.TransactionId,
    };

    await this.departmentsService.stupidTest('haha', 'hoho');

    this.ticketsGateway.emitPayment(notification);

    return this.getWebhookKey();
  }

  @Get('/webhooks/payment/success')
  receivePaymentFailedWebhook2(@Req() req) {
    return this.getWebhookKey();
  }

  @Post('/webhooks/payment/fail')
  receivePaymentFailedWebhookPost(@Body() body: any) {
    console.log('FAIL', body);

    // Save this in DB for history.
    const notification = {
      status: 'fail',
      email: body.EventData.Email,
      orderCode: body.EventData.OrderCode,
      statusId: body.EventData.StatusId,
      transactionId: body.EventData.TransactionId,
    };

    this.ticketsGateway.emitPayment(notification);

    return this.getWebhookKey();
  }

  @Get('/webhooks/payment/fail')
  receivePaymentFailedWebhook(@Req() req) {
    return this.getWebhookKey();
  }
}
