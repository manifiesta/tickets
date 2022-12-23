import { Component, OnInit } from '@angular/core';
import { SellersService } from 'src/app/shared/services/api/sellers.service';

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrls: ['./page-home.component.scss']
})
export class PageHomeComponent implements OnInit {

  displayedSellersColumns: string[] = ['sellerId', 'email', 'name', 'details', 'quantity'];
  sellerSellingInformationsAll: any[] = [];
  sellingInformationsAmountTickets!: number;

  constructor(private sellersService: SellersService) { }

  ngOnInit(): void {
    this.sellersService.getAllSellerSellingInformation().subscribe(data => {
      this.sellerSellingInformationsAll = data.data;
      this.sellingInformationsAmountTickets = data.totalAmountTicket;
      console.log('seller selling informations', this.sellerSellingInformationsAll, this.sellingInformationsAmountTickets)
    });
  }

}
