import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Auth } from '../shared/decorators/auth.decorator';
import { RoleEnum } from '../shared/role.enum';
import { AdminsService } from './admins.service';
import { LoginDto } from './login.dto';
import { FinishOrderDto } from './dto/finish-order.dto';

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
  @Get('/sellingsInformations/departments')
  getAllDepartmentsSellingsInformations() {
    return this.adminsService.getAllDepartmentsSellingsInformations();
  }

  @Auth(RoleEnum.Connected)
  @Get('/sellingsInformations/order-not-finish')
  getOrderNotFinish() {
    return this.adminsService.getOrderNotFinish();
  }

  @Auth(RoleEnum.Connected)
  @Post('/sellingsInformations/finish-order')
  finishOrder(@Body() finishOrder: FinishOrderDto) {
    return this.adminsService.finishOrder(finishOrder);
  }

}
