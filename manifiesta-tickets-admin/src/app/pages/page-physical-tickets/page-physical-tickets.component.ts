import { Component, OnInit } from '@angular/core';
import { SellersService } from 'src/app/shared/services/api/sellers.service';

@Component({
  selector: 'app-page-physical-tickets',
  templateUrl: './page-physical-tickets.component.html',
  styleUrls: ['./page-physical-tickets.component.scss']
})
export class PagePhysicalTicketsComponent implements OnInit {

  displayedPhysicalTicketsColumns: string[] = ['eventsquareReference', 'address', 'name', 'sendDone'];
  physicalTickets: any[] = [];

  constructor(private sellersService: SellersService) { }

  ngOnInit(): void {
    this.sellersService.getAllPhysicalTickets().subscribe(data => {
      this.physicalTickets = data;
    });
  }

}
