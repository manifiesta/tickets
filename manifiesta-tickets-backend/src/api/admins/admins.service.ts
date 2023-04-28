import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { EncryptionsService } from '../encryptions/encryptions.service';
import { Seller } from '../sellers/seller.entity';
import { departments } from '../shared/data/departments.list';
import { Address } from '../tickets/address.entity';
import { SellingInformation } from '../tickets/selling-information.entity';
import { Admin } from './admin.entity';
import { LoginDto } from './login.dto';

@Injectable()
export class AdminsService {

  jwt = require('jsonwebtoken');

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(SellingInformation)
    private readonly sellingInformationRepository: Repository<SellingInformation>,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    private readonly encryptionService: EncryptionsService,
  ) { }
  
  createUserToken(admin: Admin) {
    return this.jwt.sign({ email: admin.email, id: admin.id }, process.env.JWT_SECURITY_KEY);
  }

  async login(loginDto: LoginDto) {
    const admin = await this.findUserByEmailAdmin(loginDto.email);

    // the user exist?
    if (!admin) {
      throw new HttpException({ message: ['Bad email?'], code: 'login-001' }, HttpStatus.BAD_REQUEST);
    }

    // it is the good password?
    if (!await this.encryptionService.compare(loginDto.password, admin.password)) {
      throw new HttpException({ message: ['Bad password.'], code: 'login-002' }, HttpStatus.BAD_REQUEST);
    }

    const token = await this.createUserToken(admin);

    return { token, email: admin.email };
  }

  findUserByEmailAdmin(email: string) {
    return this.adminRepository.findOne({ where: { email: email } });
  }

  getAllPhysicalTickets() {
    return this.addressRepository.find();
  }

  private getNumberOfTicket(data: any[]): number {
    let totalAmountTicket = 0;
    data.forEach(t => {
      totalAmountTicket += t.quantity || 0;
    });
    return totalAmountTicket;
  }

  async physicalTicketSendDone(id) {
    const address = await this.addressRepository.findOneBy({ id });
    address.sendDone = !address.sendDone;
    return this.addressRepository.save(address);
  }

  async getAllSellingsInformation() {
    const data = await this.sellingInformationRepository.find();
    return { data, totalAmountTicket: this.getNumberOfTicket(data) };
  }

  async getAllSellersSellingsInformation(): Promise<{ data: any[], totalAmountTicket: number }> {
    const data = await this.sellingInformationRepository.find({
      where: { eventsquareReference: Not(IsNull()) },
      order: { sellerId: 'ASC' },
    });

    const dataGroupBySellerId = [];

    data.forEach(d => {
      const index = dataGroupBySellerId.findIndex(x => x.sellerId === d.sellerId);
      if (index > -1) {
        dataGroupBySellerId[index].quantity += d.quantity;
        dataGroupBySellerId[index].details.push(d);
      } else {
        dataGroupBySellerId.push({
          sellerId: d.sellerId,
          quantity: d.quantity,
          details: [d],
        });
      }
    });

    for (let i = 0; i < dataGroupBySellerId.length; i++) {
      const u = await this.sellerRepository.findOne({ where: { email: dataGroupBySellerId[i].sellerId } })
      dataGroupBySellerId[i].name = u?.name;
    }

    dataGroupBySellerId.sort((a, b) => {
      return b.quantity - a.quantity;
    });

    return { data: dataGroupBySellerId, totalAmountTicket: this.getNumberOfTicket(dataGroupBySellerId) };
  }

  async getAllDepartmentsSellingsInformations() {
    const data = await this.sellingInformationRepository.find({
      where: { eventsquareReference: Not(IsNull()) },
      order: { sellerDepartmentId: 'ASC' }
    });

    const dataGroupBySellerDepartmentId = [];

    data.forEach(d => {
      const index = dataGroupBySellerDepartmentId.findIndex(
        x => x.sellerDepartmentId === d.sellerDepartmentId
      );
      if (index > -1) {
        dataGroupBySellerDepartmentId[index].quantity += d.quantity;
        dataGroupBySellerDepartmentId[index].details.push(d);
      } else {
        dataGroupBySellerDepartmentId.push({
          sellerDepartmentId: d.sellerDepartmentId,
          quantity: d.quantity,
          name: departments.find(department => department.code === d.sellerDepartmentId)?.label,
          details: [d],
        });
      }
    });

    return {
      data: dataGroupBySellerDepartmentId,
      totalAmountTicket: this.getNumberOfTicket(dataGroupBySellerDepartmentId)
    };
  }

  async getOrderNotFinish() {
    return this.sellingInformationRepository.find({
      where: { vwTransactionId: IsNull() }
    });
  }
}
