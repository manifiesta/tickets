import { Component, OnInit } from '@angular/core';
import { SellersService } from 'src/app/shared/services/api/sellers.service';

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrls: ['./page-home.component.scss']
})
export class PageHomeComponent implements OnInit {

  displayedColumns: string[] = ['email', 'firstName', 'lastName', 'sellTickets', 'department'];
  sellers: any[] = [];
  sellingInformationsAll: any[] = [];
  sellingInformationsAmountTickets!: number;

  constructor(private sellersService: SellersService) { }

  ngOnInit(): void {
    this.sellersService.getAll().subscribe(data => {
      this.sellers = data;
    });

    this.sellersService.getAllSellingInformation().subscribe(data => {
      this.sellingInformationsAll = data.data;
      this.sellingInformationsAmountTickets = data.totalAmountTicket;
      console.log('selling informations', this.sellingInformationsAll, this.sellingInformationsAmountTickets)
    });
  }

}
