import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { SellersService } from 'src/app/shared/services/api/sellers.service';
import { sortData } from 'src/app/shared/utils/sort-data.utils';

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrls: ['./page-home.component.scss']
})
export class PageHomeComponent implements OnInit {

  displayedSellersColumns: string[] = ['name', 'sellerId', 'details', 'quantity'];
  sellerSellingInformationsAll: any[] = [];
  sellingInformationsAmountTickets!: number;
  sortedData: any[] = [];

  constructor(private sellersService: SellersService, public dialog: MatDialog) { }

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

  details(element: any) {
    const dialogRef = this.dialog.open(SellerSellingModal, {
      data: element,
    });
  }

}

@Component({
  selector: 'app-seller-selling-modal',
  templateUrl: 'seller-selling-modal.html',
})
export class SellerSellingModal {
  constructor(
    public dialogRef: MatDialogRef<SellerSellingModal>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}
}
