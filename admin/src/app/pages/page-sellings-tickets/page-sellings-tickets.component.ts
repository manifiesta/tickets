import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SellersService } from 'src/app/shared/services/api/sellers.service';
import { ExcelService } from 'src/app/shared/services/communication/excel.service';

@Component({
  selector: 'app-page-sellings-tickets',
  templateUrl: './page-sellings-tickets.component.html',
  styleUrls: ['./page-sellings-tickets.component.scss']
})
export class PageSellingsTicketsComponent implements OnInit {

  displayedDepartmentColumns: string[] = ['type', 'clientName', 'channel', 'zip', 'date', 'price', 'sellerName', 'workGroup', 'merchRef'];
  sellingInformationsAllBase: any[] = [];
  sellingInformationsAmountTickets!: number;

  // Filter
  table: any[] = [];
  isWorkingGroup = false;
  zipList: string[] = [];
  zipSelected = new FormControl([]);
  zipAsked = '';
  channelList: string[] = [];
  channelSelected = new FormControl([]);
  sellerNameList: string[] = [];
  sellerNameSelected = new FormControl([]);
  sellerNameAsked = '';

  constructor(
    private sellersService: SellersService,
    public dialog: MatDialog,
    private excelService: ExcelService,
  ) { }

  ngOnInit(): void {
    this.sellersService.getAllFinishSellingsInformationTickets().subscribe(data => {
      this.sellingInformationsAllBase = data;
      this.sellingInformationsAmountTickets = this.sellingInformationsAllBase.length;
      this.table = this.sellingInformationsAllBase;

      this.zipList = [...new Set(this.sellingInformationsAllBase.map(s => s.zip))].sort();
      this.channelList = [...new Set(this.sellingInformationsAllBase.map(s => s.channel))].sort();
      this.sellerNameList = [...new Set(this.sellingInformationsAllBase.map(s => s.sellerName))].sort();

      // usefull to get all email adress
      // const listOfMail: any[] = [...new Set(data.map((d: any) => d.sellerId.toLowerCase()))];
      // console.log(
      //   'list of mail', data,
      //   listOfMail,
      //   listOfMail.slice(0, 99).join(','),
      //   listOfMail.slice(99, 199).join(','),
      //   listOfMail.slice(199, 299).join(','),
      //   listOfMail.slice(299, 399).join(','),
      //   listOfMail.slice(399, 499).join(','),
      //   listOfMail.slice(499, 599).join(','),
      //   listOfMail.slice(599, 699).join(','),
      //   listOfMail.slice(699, 799).join(','),
      //   listOfMail.slice(799, 899).join(','),
      //   listOfMail.slice(899, 999).join(','),
      //   listOfMail.slice(999, 1099).join(','),
      //   listOfMail.slice(1099, 1199).join(','),
      // )
    });
  }

  export() {
    this.excelService.exportAsExcelFile(this.sellingInformationsAllBase, 'all-tickets-sellings-snapshot');
  }

  filtering() {
    console.log('eeee')
    this.table = this.sellingInformationsAllBase;

    if (this.isWorkingGroup) {
      this.table = this.sellingInformationsAllBase.filter(x => {return x.workGroup });
    }

    if (this.zipSelected?.value && this.zipSelected?.value?.length > 0) {
      this.table = this.table.filter(x => { return this.zipSelected.value?.includes(x.zip as never) });
    }

    if (this.channelSelected?.value && this.channelSelected?.value?.length > 0) {
      this.table = this.table.filter(x => { return this.channelSelected.value?.includes(x.channel as never) });
    }

    if (this.sellerNameSelected?.value && this.sellerNameSelected?.value?.length > 0) {
      this.table = this.table.filter(x => { return this.sellerNameSelected.value?.includes(x.sellerName as never) });
    }

    if (this.zipAsked && this.zipAsked !== '') {
      this.table = this.table.filter(x => { return x.zip?.toLowerCase().includes(this.zipAsked.toLowerCase()) });
    }

    if (this.sellerNameAsked && this.sellerNameAsked !== '') {
      this.table = this.table.filter(x => { return x?.sellerName?.toLowerCase().includes(this.sellerNameAsked.toLowerCase()) });
    }
  }

  changeWorkingGroup() {
    this.isWorkingGroup = !this.isWorkingGroup;
    this.filtering();
  }

}
