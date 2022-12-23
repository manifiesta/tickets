import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom, map, forkJoin, catchError } from 'rxjs';
import { Repository } from 'typeorm';
import { URLSearchParams } from 'url';
import { Address } from './address.entity';
import { ConfirmTicketsDto } from './dto/confirm-tickets.dto';
import { SellingInformation } from './selling-information.entity';
// import FormData from 'form-data';

@Injectable()
export class TicketsService {

  apiKey = process.env.EVENT_SQUARE_API_KEY;
  posToken = process.env.EVENT_SQUARE_POS_TOKEN;

  vwSecret = process.env.VIVA_WALLET_SMART_CHECKOUT_SECRET;
  vwClient = process.env.VIVA_WALLET_SMART_CHECKOUT_CLIENT_ID;

  acceptedShop = ['app', 'comac', 'intal', 'redfox', 'cubanismo', 'vrijwilligers', 'partners-manifiesta'];

  constructor(
    private httpService: HttpService,
    @InjectRepository(SellingInformation)
    private readonly sellingInformationRepository: Repository<SellingInformation>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) { }

  getAllTicketTypes(shop: string = 'app') {
    return firstValueFrom(
      this.httpService.get<any>(
        `https://api.eventsquare.io/1.0/store/manifiesta-dev/2023/${this.acceptedShop.includes(shop.toLowerCase())
          ? shop.toLowerCase() : 'app'}`, {
        headers: {
          apiKey: this.apiKey,
        }
      }).pipe(
        // TODO generic map for the .data from AXIOS
        map(d => { return d.data }),
        map(data => { return data.edition.channel.types }),
        map(tickets => { return Array.from(tickets).filter(t => t['type'] === 'ticket') }),
      )
    );
  }

  // TODO try better way with no async shit
  // TODO manage lang
  async confirmOrder(confirmTickets: ConfirmTicketsDto) {

    let quantity = 0;
    confirmTickets.tickets.forEach(e => {
      quantity += e.ticketAmount;
    });

    // If we find something, it's an error because we cannot have a vw transaction id already use
    const sellingWithVwTransactionId = await this.sellingInformationRepository.findOne(
      { where: { vwTransactionId: confirmTickets.vwTransactionId } }
    );

    console.log('is there ?', sellingWithVwTransactionId)

    if (sellingWithVwTransactionId) {
      throw new HttpException({ message: ['error transaction already existing'], code: 'transaction-already-done' }, HttpStatus.CONFLICT);
    }

    // We stock the first information before the command run, in case of, eventSquereReference will come at the end
    const sellingInformation = await this.sellingInformationRepository.save(this.sellingInformationRepository.create({
      date: new Date(),
      sellerDepartmentId: confirmTickets.sellerDepartmentId,
      sellerId: confirmTickets.sellerId,
      sellerPostalCode: confirmTickets.sellerPostalCode,
      vwTransactionId: confirmTickets.vwTransactionId,
      ticketInfo: confirmTickets.tickets,
      quantity: quantity,
    }));

    console.log('begin state', sellingInformation)

    // Verification that the transaction id exist in VW
    // TODO verify that is not already used !
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
        )
    )).access_token;

    const transactionVerification = await firstValueFrom(
      this.httpService.get<any>(`https://api.vivapayments.com/checkout/v2/transactions/${confirmTickets.vwTransactionId}`, {
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

    // If no error throw here, it's good, we can continue
    // And command the EventSquare tickets

    const cartid = (await firstValueFrom(
      this.httpService.get<any>('https://api.eventsquare.io/1.0/store/manifiesta-dev/2023/pos?language=nl&pos_token=' + this.posToken, {
        headers: {
          apiKey: this.apiKey,
        }
      }).pipe(
        // TODO generic map for the .data from AXIOS
        map(d => { return d.data }),
      )
    )).edition.cart.cartid;

    const putTicketsInCart = confirmTickets.tickets.map(
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
    bodyFormData.append('customer[firstname]', confirmTickets.firstname);
    bodyFormData.append('customer[lastname]', confirmTickets.lastname);
    bodyFormData.append('customer[email]', confirmTickets.email);
    bodyFormData.append('customer[agent]', confirmTickets.agent);
    bodyFormData.append('customer[language]', confirmTickets.language);
    bodyFormData.append('customer[ip]', confirmTickets.ip);
    bodyFormData.append('invoice', confirmTickets.invoice.toString());
    bodyFormData.append('customer[sellerId]', confirmTickets.sellerId);
    bodyFormData.append('testmode', confirmTickets.testmode.toString());
    bodyFormData.append('customer[datatest]', 'just data test from manifiesta api');
    bodyFormData.append('datatest', 'just data test from manifiesta api');

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
    sellingInformation.eventsquareReference = finalOrder.order.reference;
    await this.sellingInformationRepository.save(sellingInformation);

    // If the client demand a physical ticket
    if (confirmTickets.askSendTicket) {
      console.log('we want ticket by post, here for test')
      await this.addressRepository.save(
        await this.addressRepository.create(
          {
            city: confirmTickets.address.city,
            eventsquareReference: finalOrder.order.reference,
            firstName: confirmTickets.firstname,
            lastName: confirmTickets.lastname,
            number: confirmTickets.address.number,
            postCode: confirmTickets.address.postCode,
            street: confirmTickets.address.street,
            sendDone: false,
          }
        )
      )
    }

    return finalOrder;
  }

  async getTransactionById(id: string) {
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
        )
    )).access_token;

    return firstValueFrom(
      this.httpService.get<any>(`https://api.vivapayments.com/checkout/v2/transactions/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }).pipe(
        // TODO generic map for the .data from AXIOS
        map(d => { return d.data }),
      )
    ).catch(e => {
      throw new HttpException({ message: ['error transaction not existing'] }, HttpStatus.NOT_FOUND);
    });
  }

  private getNumberOfTicket(data: any[]): number {
    let totalAmountTicket = 0;
    data.forEach(t => {
      totalAmountTicket += t.quantity || 0;
    });
    return totalAmountTicket;
  }

  async getAllSellingInformation() {
    const data = await this.sellingInformationRepository.find();
    return { data, totalAmountTicket: this.getNumberOfTicket(data) };
  }

  async getSellerSellingInformation(beepleId: string) {
    const data = await this.sellingInformationRepository.find({ where: { sellerId: beepleId } });
    return { data, totalAmountTicket: this.getNumberOfTicket(data) };
  }

  async getAllSellerSellingInformation() {
    const data = await this.sellingInformationRepository.find({
      order: { sellerId: 'ASC' }
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

    return { data: dataGroupBySellerId, totalAmountTicket: this.getNumberOfTicket(dataGroupBySellerId) };
  }

  async getAllDepartmentSellingInformation() {
    const data = await this.sellingInformationRepository.find({
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
          details: [d],
        });
      }
    });

    return {
      data: dataGroupBySellerDepartmentId,
      totalAmountTicket: this.getNumberOfTicket(dataGroupBySellerDepartmentId)
    };
  }

  async getAllPhysicalTickets() {
    return this.addressRepository.find();
  }

}
