import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom, map, forkJoin } from 'rxjs';
import { ConfirmTicketsDto } from './dto/confirm-tickets.dto';
// import FormData from 'form-data';

@Injectable()
export class TicketsService {

  apiKey = process.env.EVENT_SQUARE_API_KEY;
  posToken = process.env.EVENT_SQUARE_POS_TOKEN;

  constructor(private httpService: HttpService) { }

  getAllTicketTypes() {
    return firstValueFrom(
      this.httpService.get<any>('https://api.eventsquare.io/1.0/store/manifiesta-dev/2023', {
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

    return firstValueFrom(
      this.httpService.get<any>(`https://api.eventsquare.io/1.0/checkout/${orderid}`, {
        headers: {
          apiKey: this.apiKey,
        }
      }).pipe(
        // TODO generic map for the .data from AXIOS
        map(d => { return d.data }),
      )
    );

  }

}
