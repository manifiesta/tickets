import { Injectable } from '@nestjs/common';

@Injectable()
export class TicketsService {

  // TODO waiting for EventSquare
  // Price in cent
  getAllTicketTypes() {
    return [
      {
        label: 'One day',
        price: 1800,
      },
      {
        label: 'Week end',
        price: 3000,
      },
      {
        label: 'Test Demo',
        price: 1,
      }
    ]
  }

}
