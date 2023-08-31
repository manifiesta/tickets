import puppeteer, { ElementHandle } from 'puppeteer';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isBoolean, isNumber } from 'class-validator';
import { log, timeStamp } from 'console';
import { firstValueFrom, map, forkJoin, catchError, tap } from 'rxjs';
import { IsNull, Not, Repository } from 'typeorm';
import { URLSearchParams } from 'url';
import { Seller } from '../sellers/seller.entity';
import { departments, provinces } from '../shared/data/departments.list';
import { Address } from './address.entity';
import { ConfirmTicketsDto } from './dto/confirm-tickets.dto';
import { NewsletterAddDto } from './dto/newsletter-add.dto';
import { PreparTicketsDto } from './dto/prepar-tickets.dto';
import { SellingInformation } from './selling-information.entity';
// import FormData from 'form-data';

@Injectable()
export class TicketsService {
  apiKey = process.env.EVENT_SQUARE_API_KEY;
  posToken = process.env.EVENT_SQUARE_POS_TOKEN;

  vwSecret = process.env.VIVA_WALLET_SMART_CHECKOUT_SECRET;
  vwClient = process.env.VIVA_WALLET_SMART_CHECKOUT_CLIENT_ID;

  acceptedShop = ['app', 'comac', 'redfox', 'base', 'gvhv', 'other', 'cubanismo', 'intal', 'marianne'];

  constructor(
    private httpService: HttpService,
    @InjectRepository(SellingInformation)
    private readonly sellingInformationRepository: Repository<SellingInformation>,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) { }

  private reduceName(name: string, workGroup = false): string {
    if (!name) {
      return undefined;
    }
    const split = name.split(' ');
    const firstName = split.shift();
    const lastName = split.map((e) => e[0]).join('');

    return `${workGroup && firstName ? firstName[0] : firstName} ${lastName}`
  }

  getAllTicketTypes(shop: string = 'app') {
    // return [];
    return firstValueFrom(
      this.httpService.get<any>(
        `https://api.eventsquare.io/1.0/store/manifiesta/2023/${this.acceptedShop.includes(shop.toLowerCase())
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

  presenceOfTestTicket(preparTickets: PreparTicketsDto | ConfirmTicketsDto): boolean {
    return preparTickets.tickets.findIndex(ts => {
      return ts.ticketLabel.includes('[TEST]')
    }) > -1;
  }

  async preparOrder(preparTickets: PreparTicketsDto) {
    if (!this.presenceOfTestTicket(preparTickets)) {
      const seller = await this.sellerRepository.findOne({
        where: { email: preparTickets.sellerId },
      });
      if (!seller) {
        await this.sellerRepository.save(
          await this.sellerRepository.create({
            email: preparTickets.sellerId,
            name: preparTickets.sellerName,
            workGroup: preparTickets.fromWorkGroup,
          }),
        );
      } else {
        seller.name = preparTickets.sellerName;
        seller.workGroup = preparTickets.fromWorkGroup;
        this.sellerRepository.save(seller);
      }

      let quantity = 0;
      preparTickets.tickets.forEach((e) => {
        quantity += e.ticketAmount;
      });

      const sellingInformation = await this.sellingInformationRepository.save(
        this.sellingInformationRepository.create({
          date: new Date(),
          sellerDepartmentId: preparTickets.sellerDepartmentId,
          sellerId: preparTickets.sellerId,
          sellerPostalCode: preparTickets.sellerPostalCode,
          ticketInfo: preparTickets.tickets,
          quantity: quantity,
          clientTransactionId: preparTickets.clientTransactionId,
          clientName: `${preparTickets.firstname} ${preparTickets.lastname}`,
          fromWorkGroup: preparTickets.fromWorkGroup,
          clientEmail: preparTickets.email,
        }));

      return sellingInformation;
    }

    return preparTickets;
  }

  // TODO try better way with no async shit
  // TODO manage lang
  async confirmOrder(confirmTickets: ConfirmTicketsDto) {
    const ticketTest = this.presenceOfTestTicket(confirmTickets);

    let quantity = 0;
    confirmTickets.tickets.forEach((e) => {
      quantity += e.ticketAmount;
    });

    // If we find something, it's an error because we cannot have a vw transaction id already use
    const sellingWithVwTransactionId =
      await this.sellingInformationRepository.findOne({
        where: { vwTransactionId: confirmTickets.vwTransactionId },
      });

    if (sellingWithVwTransactionId) {
      throw new HttpException(
        {
          message: ['error transaction already existing'],
          code: 'transaction-already-done',
        },
        HttpStatus.CONFLICT,
      );
    }

    let sellingInformation;

    // If there are some testing ticket, we register nothing
    if (!ticketTest) {
      const sellingInformationWithClientTransactionId =
        await this.sellingInformationRepository.findOne({
          where: { clientTransactionId: confirmTickets.clientTransactionId },
        });

      if (sellingInformationWithClientTransactionId) {
        sellingInformation = sellingInformationWithClientTransactionId;
        sellingInformation.vwTransactionId = confirmTickets.vwTransactionId;
        await this.sellingInformationRepository.save(sellingInformation);
      } else {
        // We stock the first information before the command run, in case of, eventSquereReference will come at the end
        sellingInformation = await this.sellingInformationRepository.save(
          this.sellingInformationRepository.create({
            date: new Date(),
            sellerDepartmentId: confirmTickets.sellerDepartmentId,
            sellerId: confirmTickets.sellerId,
            sellerPostalCode: confirmTickets.sellerPostalCode,
            ticketInfo: confirmTickets.tickets,
            quantity: quantity,
            clientTransactionId: confirmTickets.clientTransactionId,
            clientName: `${confirmTickets.firstname} ${confirmTickets.lastname}`,
            vwTransactionId: confirmTickets.vwTransactionId,
            fromWorkGroup: confirmTickets.fromWorkGroup,
            clientEmail: confirmTickets.email,
          }));
      }
    }

    // Verification that the transaction id exist in VW
    // TODO verify that is not already used !
    const accessToken = await this.getVivaWaletAccessToken();

    const transactionVerification = await firstValueFrom(
      this.httpService
        .get<any>(
          `https://api.vivapayments.com/checkout/v2/transactions/${confirmTickets.vwTransactionId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .pipe(
          // TODO generic map for the .data from AXIOS
          map((d) => {
            return d.data;
          }),
        ),
    ).catch((e) => {
      throw new HttpException(
        {
          message: ['error transaction not existing'],
          code: 'transaction-not-existing',
        },
        HttpStatus.NOT_FOUND,
      );
    });

    // If no error throw here, it's good, we can continue
    // And command the EventSquare tickets
    const cartid = (
      await firstValueFrom(
        this.httpService
          .get<any>(
            'https://api.eventsquare.io/1.0/store/manifiesta/2023/app?language=nl&pos_token=' +
            this.posToken,
            {
              headers: {
                apiKey: this.apiKey,
              },
            },
          )
          .pipe(
            // TODO generic map for the .data from AXIOS
            map((d) => {
              return d.data;
            }),
            catchError((e) => {
              return e;
            }),
          ),
      )
    ).edition.cart.cartid;

    const putTicketsInCart = confirmTickets.tickets.map((t) => {
      return this.httpService.put<any>(
        `https://api.eventsquare.io/1.0/cart/${cartid}/types/${t.ticketId}?quantity=${t.ticketAmount}`,
        {},
        {
          headers: {
            apiKey: this.apiKey,
          },
        },
      );
    });

    await firstValueFrom(forkJoin(putTicketsInCart));

    const FormData = require('form-data');
    const bodyFormData = new FormData();
    bodyFormData.append('redirecturl', 'https://www.manifiesta.be');
    bodyFormData.append('customer[firstname]', confirmTickets.firstname);
    bodyFormData.append('customer[lastname]', confirmTickets.lastname);
    bodyFormData.append('customer[email]', confirmTickets.email);
    bodyFormData.append('customer[agent]', 'ManifiestApp');
    bodyFormData.append('customer[language]', 'nl');
    bodyFormData.append('customer[ip]', '127.0.0.1');
    bodyFormData.append('invoice', 0);
    bodyFormData.append('customer[sellerId]', confirmTickets.sellerId);
    bodyFormData.append('testmode', 0);

    // console.log('ok 2', bodyFormData)

    const orderid = (
      await firstValueFrom(
        this.httpService
          .post<any>(
            `https://api.eventsquare.io/1.0/cart/${cartid}`,
            bodyFormData,
            {
              headers: {
                apiKey: this.apiKey,
                'Content-Type': 'multipart/form-data; boundary=<calculated when request is sent>'
              },
            },
          )
          .pipe(
            // TODO generic map for the .data from AXIOS
            map((d) => {
              return d.data;
            }),
            // catchError((e) => {
            //   console.log('perkele', e, e.response, e.response.data)
            //   return e.response.data;
            // }),
          ),
      )
    ).order.orderid;

    // console.log('ok 3', orderid)

    const finalOrder = await firstValueFrom(
      this.httpService
        .get<any>(`https://api.eventsquare.io/1.0/checkout/${orderid}`, {
          headers: {
            apiKey: this.apiKey,
          },
        })
        .pipe(
          // TODO generic map for the .data from AXIOS
          map((d) => {
            return d.data;
          }),
        ),
    );

    if (!ticketTest) {
      sellingInformation.eventsquareReference = finalOrder.order.reference;
      await this.sellingInformationRepository.save(sellingInformation);
    }

    // If the client demand a physical ticket
    if (confirmTickets.askSendTicket) {
      await this.addressRepository.save(
        await this.addressRepository.create({
          city: confirmTickets.address.city,
          eventsquareReference: finalOrder.order.reference,
          firstName: confirmTickets.firstname,
          lastName: confirmTickets.lastname,
          number: confirmTickets.address.number,
          postCode: confirmTickets.address.postCode,
          street: confirmTickets.address.street,
          sendDone: false,
        }),
      );
    }

    return finalOrder;
  }

  async getTransactionById(id: string) {
    const bodyXWWWFORMURLData = new URLSearchParams();
    bodyXWWWFORMURLData.append('grant_type', 'client_credentials');

    const accessToken = (
      await firstValueFrom(
        this.httpService
          .post<any>(
            `https://accounts.vivapayments.com/connect/token`,
            bodyXWWWFORMURLData,
            {
              auth: {
                password: this.vwSecret,
                username: this.vwClient,
              },
            },
          )
          .pipe(
            // TODO generic map for the .data from AXIOS
            map((d) => {
              return d.data;
            }),
          ),
      )
    ).access_token;

    return firstValueFrom(
      this.httpService
        .get<any>(
          `https://api.vivapayments.com/checkout/v2/transactions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .pipe(
          // TODO generic map for the .data from AXIOS
          map((d) => {
            return d.data;
          }),
        ),
    ).catch((e) => {
      throw new HttpException(
        { message: ['error transaction not existing'] },
        HttpStatus.NOT_FOUND,
      );
    });
  }

  private getNumberOfTicket(data: any[]): number {
    let totalAmountTicket = 0;
    data.forEach((t) => {
      totalAmountTicket += t.quantity || 0;
    });
    return totalAmountTicket;
  }

  async getAllSellingInformation() {
    const data = await this.sellingInformationRepository.find();
    return { data, totalAmountTicket: this.getNumberOfTicket(data) };
  }

  async getSellerSellingInformation(id: string) {
    let data = await this.sellingInformationRepository.find({
      where: { sellerId: id, eventsquareReference: Not(IsNull()) },
      order: { date: 'ASC' },
    });
    data = data.map((d) => {
      return {
        ...d,
        sellerDepartment:
          departments.find((df) => df.code === d.sellerDepartmentId)?.label ||
          d.sellerDepartmentId,
        clientName: this.reduceName(d.clientName),
      };
    });
    return { data, totalAmountTicket: this.getNumberOfTicket(data) };
  }

  async getTopTenSeller() {
    const myDepartmentInfo = await this.getAllSellerSellingInformation();
    return myDepartmentInfo.data.slice(0, 10);
  }

  async getAllSellerSellingInformation(): Promise<{
    data: any[];
    totalAmountTicket: number;
  }> {
    const data = await this.sellingInformationRepository.find({
      where: { eventsquareReference: Not(IsNull()) },
      order: { sellerId: 'ASC' },
    });

    const dataGroupBySellerId = [];

    data.forEach((d) => {
      const index = dataGroupBySellerId.findIndex(
        (x) => x.sellerId === d.sellerId,
      );
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
      const u = await this.sellerRepository.findOne({
        where: { email: dataGroupBySellerId[i].sellerId },
      });
      dataGroupBySellerId[i].name = this.reduceName(u?.name, u?.workGroup);
    }

    dataGroupBySellerId.sort((a, b) => {
      return b.quantity - a.quantity;
    });

    return {
      data: dataGroupBySellerId,
      totalAmountTicket: this.getNumberOfTicket(dataGroupBySellerId),
    };
  }

  async getMyDepartmentTopTen(
    sellerdepartmentId: string,
    sellerPostCode: string,
  ) {
    const myDepartmentInfo = await this.getOneDepartmentSellingInformation(
      sellerdepartmentId,
      sellerPostCode,
    );
    return myDepartmentInfo.bestSelling.slice(0, 10);
  }

  async getOneDepartmentSellingInformation(
    sellerdepartmentId: string,
    sellerPostCode: string,
  ): Promise<{ data: any[]; bestSelling: any[]; totalAmountTicket: number }> {
    let province;
    const postCodeNumber = parseInt(sellerPostCode);
    if (sellerdepartmentId === 'BASE' && isNumber(parseInt(sellerPostCode))) {
      province = provinces.find((p) =>
        p.ranges.find((r) => {
          return r.start <= postCodeNumber && r.end >= postCodeNumber;
        }),
      );
    }

    let dataBrut = await this.sellingInformationRepository.find({
      where: {
        sellerDepartmentId: sellerdepartmentId,
        eventsquareReference: Not(IsNull()),
      },
    });

    if (province) {
      dataBrut = dataBrut.filter((d) => {
        return province.ranges.find((r) => {
          return r.start <= d.sellerPostalCode && r.end >= d.sellerPostalCode;
        });
      });
    }

    const bestSelling = [];

    dataBrut.forEach((d) => {
      const index = bestSelling.findIndex((x) => x.sellerId === d.sellerId);
      if (index > -1) {
        bestSelling[index].quantity += d.quantity;
        bestSelling[index].details.push(d);
      } else {
        bestSelling.push({
          sellerId: d.sellerId,
          quantity: d.quantity,
          details: [d],
        });
      }
    });

    for (let i = 0; i < bestSelling.length; i++) {
      const u = await this.sellerRepository.findOne({
        where: { email: bestSelling[i].sellerId },
      });
      bestSelling[i].name = this.reduceName(u?.name, u?.workGroup);
    }

    bestSelling.sort((a, b) => {
      return b.quantity - a.quantity;
    });

    return {
      data: dataBrut,
      bestSelling: bestSelling,
      totalAmountTicket: this.getNumberOfTicket(bestSelling),
    };
  }

  async getOnePostCodeSellingInformation(
    postalCode: string,
    departmentCode: string,
    fromWorkGroup: string,
  ): Promise<{ data: any[]; bestSelling: any[]; totalAmountTicket: number }> {
    const dataBrut = await this.sellingInformationRepository.find({
      where: {
        sellerPostalCode: postalCode,
        eventsquareReference: Not(IsNull()),
        sellerDepartmentId: departmentCode,
        fromWorkGroup: fromWorkGroup === 'true',
      },
    });

    const bestSelling = [];

    dataBrut.forEach((d) => {
      const index = bestSelling.findIndex((x) => x.sellerId === d.sellerId);
      if (index > -1) {
        bestSelling[index].quantity += d.quantity;
        bestSelling[index].details.push(d);
      } else {
        bestSelling.push({
          sellerId: d.sellerId,
          quantity: d.quantity,
          details: [d],
        });
      }
    });

    for (let i = 0; i < bestSelling.length; i++) {
      const u = await this.sellerRepository.findOne({
        where: { email: bestSelling[i].sellerId },
      });
      bestSelling[i].name = this.reduceName(u?.name, fromWorkGroup === 'true');
    }

    bestSelling.sort((a, b) => {
      return b.quantity - a.quantity;
    });

    return {
      data: dataBrut,
      bestSelling: bestSelling,
      totalAmountTicket: this.getNumberOfTicket(bestSelling),
    };
  }

  async getAllDepartmentSellingInformation() {
    const data = await this.sellingInformationRepository.find({
      where: { eventsquareReference: Not(IsNull()) },
      order: { sellerDepartmentId: 'ASC' },
    });

    const dataGroupBySellerDepartmentId = [];

    data.forEach((d) => {
      const index = dataGroupBySellerDepartmentId.findIndex(
        (x) => x.sellerDepartmentId === d.sellerDepartmentId,
      );
      if (index > -1) {
        dataGroupBySellerDepartmentId[index].quantity += d.quantity;
        dataGroupBySellerDepartmentId[index].details.push(d);
      } else {
        dataGroupBySellerDepartmentId.push({
          sellerDepartmentId: d.sellerDepartmentId,
          quantity: d.quantity,
          name: departments.find(
            (department) => department.code === d.sellerDepartmentId,
          )?.label,
          details: [d],
        });
      }
    });

    return {
      data: dataGroupBySellerDepartmentId,
      totalAmountTicket: this.getNumberOfTicket(dataGroupBySellerDepartmentId),
    };
  }

  async newsletterAddMember(newsletterAdd: NewsletterAddDto) {
    const mailchimp = require('@mailchimp/mailchimp_marketing');

    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });

    const lists = await mailchimp.lists.getAllLists();
    const newsId = lists?.lists?.find((l) => l.name === 'ManiFiesta News')?.id;

    try {
      const add = await mailchimp.lists.addListMember(newsId, {
        email_address: newsletterAdd.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: newsletterAdd.firstname,
          LNAME: newsletterAdd.lastname,
          MMERGE6: newsletterAdd.MMERGE6,
        },
      });
    } catch (e) {
      console.error(e);
    }

    return { hello: 'world' };
  }

  async getVivaWaletAccessToken() {
    const bodyXWWWFORMURLData = new URLSearchParams();

    bodyXWWWFORMURLData.append('grant_type', 'client_credentials');

    const accessToken = (
      await firstValueFrom(
        this.httpService
          .post<any>(
            `https://accounts.vivapayments.com/connect/token`,
            bodyXWWWFORMURLData,
            {
              auth: {
                password: this.vwSecret,
                username: this.vwClient,
              },
            },
          )
          .pipe(
            // TODO generic map for the .data from AXIOS
            map((d) => {
              return d.data;
            }),
          ),
      )
    ).access_token;

    return accessToken;
  }

  async createPaymentOrder(orderInfo, forApp = false) {
    const accessToken = await this.getVivaWaletAccessToken();
    const amount = orderInfo.amount;
    const merchantTrns = orderInfo.merchantTrns;

    return firstValueFrom(
      this.httpService.post(
        'https://api.vivapayments.com/checkout/v2/orders',
        {
          amount,
          merchantTrns,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    );
  }

  async getPayconicQrCode(paymentOrder: any, forApp = false) {
    // stupid bug with viva wallet and some order number that begin by 9
    let isBadOrderCode = false;
    let orderCodePromise;
    let orderCode;
    do {
      orderCodePromise = await this.createPaymentOrder(paymentOrder, forApp);
      orderCode = orderCodePromise.data.orderCode.toString();
      isBadOrderCode = orderCode[0] == '9';
    } while(isBadOrderCode)

    return { orderCode: orderCode.toString() }
  }
}
