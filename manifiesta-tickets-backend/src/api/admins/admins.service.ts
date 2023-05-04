import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { EncryptionsService } from '../encryptions/encryptions.service';
import { Seller } from '../sellers/seller.entity';
import { departments, provinces } from '../shared/data/departments.list';
import { Address } from '../tickets/address.entity';
import { SellingInformation } from '../tickets/selling-information.entity';
import { Admin } from './admin.entity';
import { LoginDto } from './login.dto';
import { FinishOrderDto } from './dto/finish-order.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, forkJoin, map } from 'rxjs';
import { isNumber } from 'class-validator';

@Injectable()
export class AdminsService {

  jwt = require('jsonwebtoken');

  apiKey = process.env.EVENT_SQUARE_API_KEY;
  posToken = process.env.EVENT_SQUARE_POS_TOKEN;

  vwSecret = process.env.VIVA_WALLET_SMART_CHECKOUT_SECRET;
  vwClient = process.env.VIVA_WALLET_SMART_CHECKOUT_CLIENT_ID;

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
    private httpService: HttpService,
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

      const postCodeNumber = parseInt(d.sellerPostalCode);
      if (d.sellerDepartmentId === 'BASE' && isNumber(postCodeNumber)) {
        const province = provinces.find((p) =>
          p.ranges.find((r) => {
            return r.start <= postCodeNumber && r.end >= postCodeNumber;
          }),
        );

        console.log('rpovince ?', province)
        d.sellerDepartmentId = province.code;
        d['name'] = province.label;
      }


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
          name:d['name'] || departments.find(department => department.code === d.sellerDepartmentId)?.label,
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

  // TODO big refactor doublon part of the create ticket
  async finishOrder(finishOrder: FinishOrderDto) {
    const order = await this.sellingInformationRepository.findOne(
      { where: { clientTransactionId: finishOrder.clientTransactionId } }
    );

    console.log('the order', order, finishOrder, finishOrder.clientTransactionId)

    // Verification that the transaction id exist in VW
    const bodyXWWWFORMURLData = new URLSearchParams();
    bodyXWWWFORMURLData.append('grant_type', 'client_credentials');

    const accessToken = (await firstValueFrom(
      this.httpService.post<any>(`https://accounts.vivapayments.com/connect/token`,
        bodyXWWWFORMURLData,
        {
          auth: {
            password: this.vwSecret,
            username: this.vwClient,
          }
        }).pipe(
          // TODO generic map for the .data from AXIOS
          map(d => { return d.data }),
          catchError(e => {
            console.log('error', e)
            return e;
          })
        )
    )).access_token;

    const transactionVerification = await firstValueFrom(
      this.httpService.get<any>(`https://api.vivapayments.com/checkout/v2/transactions/${finishOrder.vwTransactionId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }).pipe(
        // TODO generic map for the .data from AXIOS
        map(d => { return d.data }),
      )
    ).catch(e => {
      throw new HttpException({ message: ['error transaction not existing'], code: 'transaction-not-existing' }, HttpStatus.NOT_FOUND);
    });

    const cartid = (await firstValueFrom(
      this.httpService.get<any>('https://api.eventsquare.io/1.0/store/manifiesta/2023/app?language=nl&pos_token=' + this.posToken, {
        headers: {
          apiKey: this.apiKey,
        }
      }).pipe(
        // TODO generic map for the .data from AXIOS
        map(d => { return d.data }),
      )
    )).edition.cart.cartid;

    const putTicketsInCart = finishOrder.ticketInfo.map(
      t => {
        return this.httpService.put<any>(`https://api.eventsquare.io/1.0/cart/${cartid}/types/${t.ticketId}?quantity=${t.ticketAmount}`, {}, {
          headers: {
            apiKey: this.apiKey,
          }
        })
      }
    );

    await firstValueFrom(forkJoin(putTicketsInCart));

    const FormData = require('form-data');
    const bodyFormData = new FormData();
    bodyFormData.append('redirecturl', 'https://www.manifiesta.be');
    bodyFormData.append('customer[firstname]', order.clientName.split(' ')[0]);
    bodyFormData.append('customer[lastname]', order.clientName.replace(order.clientName.split(' ')[0], ''));
    bodyFormData.append('customer[email]', order.clientEmail);
    bodyFormData.append('customer[agent]', 'ManifiestApp');
    bodyFormData.append('customer[language]', 'nl');
    bodyFormData.append('customer[ip]', '127.0.0.1');
    bodyFormData.append('invoice', 0);
    bodyFormData.append('customer[sellerId]', order.sellerId);
    bodyFormData.append('testmode', 0);

    const orderid = (await firstValueFrom(
      this.httpService.post<any>(`https://api.eventsquare.io/1.0/cart/${cartid}`,
        bodyFormData,
        {
          headers: {
            apiKey: this.apiKey,
            'Content-Type': 'multipart/form-data; boundary=<calculated when request is sent>'
          },
        }).pipe(
          // TODO generic map for the .data from AXIOS
          map(d => { return d.data }),
        )
    )).order.orderid;

    const finalOrder = await firstValueFrom(
      this.httpService.get<any>(`https://api.eventsquare.io/1.0/checkout/${orderid}`, {
        headers: {
          apiKey: this.apiKey,
        }
      }).pipe(
        // TODO generic map for the .data from AXIOS
        map(d => { return d.data }),
      )
    );


    order.eventsquareReference = finalOrder.order.reference;
    order.vwTransactionId = finishOrder.vwTransactionId;
    await this.sellingInformationRepository.save(order);

    return { order, finalOrder };
  }
}
