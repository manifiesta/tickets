import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { SellersService } from 'src/app/shared/services/api/sellers.service';
import { sortData } from 'src/app/shared/utils/sort-data.utils';

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrls: ['./page-home.component.scss']
})
export class PageHomeComponent implements OnInit {

  displayedSellersColumns: string[] = ['sellerId', 'email', 'name', 'details', 'quantity'];
  sellerSellingInformationsAll: any[] = [];
  sellingInformationsAmountTickets!: number;
  sortedData: any[] = [];

  constructor(private sellersService: SellersService) { }

  ngOnInit(): void {
    this.sellersService.getAllSellerSellingInformation().subscribe(data => {
      this.sellerSellingInformationsAll = data.data;
      this.sellingInformationsAmountTickets = data.totalAmountTicket;
      this.sortedData = this.sellerSellingInformationsAll.slice();
    });
  }

  sortingData(sort: Sort) {
    this.sortedData = sortData(sort, this.sellerSellingInformationsAll);
  }

}
