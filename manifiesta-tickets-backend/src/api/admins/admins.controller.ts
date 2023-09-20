import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Auth } from '../shared/decorators/auth.decorator';
import { RoleEnum } from '../shared/role.enum';
import { AdminsService } from './admins.service';
import { LoginDto } from './login.dto';
import { FinishOrderDto } from './dto/finish-order.dto';
import { EditLongtextDto } from './dto/edit-long-text.dto';
import { FinishOrderTransactionIdDto } from './dto/finish-order-transaction-id.dto';

@Controller('api/admins')
export class AdminsController {

  constructor(
    private readonly adminsService: AdminsService,
  ) { }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.adminsService.login(loginDto);
  }

  @Auth(RoleEnum.Connected)
  @Get('/physicalTickets')
  getAllPhysicalTickets() {
    return this.adminsService.getAllPhysicalTickets();
  }

  @Auth(RoleEnum.Connected)
  @Get('/physicalTickets/sendDone/:id')
  physicalTicketSendDone(@Param('id') id: string) {
    return this.adminsService.physicalTicketSendDone(id);
  }

  @Auth(RoleEnum.Connected)
  @Get('/sellingsInformations')
  getAllSellingsInformation() {
    return this.adminsService.getAllSellingsInformation();
  }

  @Auth(RoleEnum.Connected)
  @Get('/sellingsInformations/sellers')
  getAllSellersSellingsInformation() {
    return this.adminsService.getAllSellersSellingsInformation();
  }

  @Auth(RoleEnum.Connected)
  @Get('/sellingsInformations/sellings')
  getAllFinishSellingsInformation() {
    return this.adminsService.getAllFinishSellingsInformation();
  }

  // For this route, we extract directly the tickets informations
  @Auth(RoleEnum.Connected)
  @Get('/sellingsInformations/sellings-tickets')
  getAllFinishSellingsInformationTickets() {
    return this.adminsService.getAllFinishSellingsInformationTickets();
  }

  @Auth(RoleEnum.Connected)
  @Get('/sellingsInformations/departments')
  getAllDepartmentsSellingsInformations() {
    return this.adminsService.getAllDepartmentsSellingsInformations();
  }

  @Auth(RoleEnum.Connected)
  @Get('/sellingsInformations/order-not-finish')
  getOrderNotFinish() {
    return this.adminsService.getOrderNotFinish();
  }

  // @Auth(RoleEnum.Connected)
  // @Post('/sellingsInformations/finish-order')
  // finishOrder(@Body() finishOrder: FinishOrderDto) {
  //   return this.adminsService.finishOrder(finishOrder);
  // }

  @Get('/longtext/:label/:lang')
  getOneLongText(@Param('label') label: string, @Param('lang') lang: string) {
    return this.adminsService.getOneLongText(label, lang);
  }

  @Auth(RoleEnum.Connected)
  @Put('/longtext')
  editOneLongText(@Body() longtext: EditLongtextDto) {
    return this.adminsService.editOneLongText(longtext);
  }

  @Auth(RoleEnum.Connected)
  @Post('/sellingsInformations/finish-order-array')
  finishOrderWithArrayOfTransactionId(@Body() finishOrders: FinishOrderTransactionIdDto[]) {
    return this.adminsService.finishOrderWithArrayOfTransactionId(finishOrders);
  }

}
