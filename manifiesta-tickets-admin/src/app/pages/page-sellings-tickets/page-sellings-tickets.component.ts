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

  displayedDepartmentColumns: string[] = ['type', 'clientName', 'channel', 'zip', 'date', 'price', 'sellerName', 'workGroup'];
  sellingInformationsAllBase: any[] = [];
  sellingInformationsAmountTickets!: number;

  // Filter
  table: any[] = [];
  isWorkingGroup = false;
  zipList: string[] = [];
  zipSelected = new FormControl([]);
  channelList: string[] = [];
  channelSelected = new FormControl([]);
  sellerNameList: string[] = [];
  sellerNameSelected = new FormControl([]);

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

      this.zipList = [...new Set(this.sellingInformationsAllBase.map(s => s.zip))];
      this.channelList = [...new Set(this.sellingInformationsAllBase.map(s => s.channel))];
      this.sellerNameList = [...new Set(this.sellingInformationsAllBase.map(s => s.sellerName))];

      console.log('all lists', this.sellingInformationsAllBase, this.zipList, this.channelList, this.sellerNameList)
    });
  }

  export() {
    this.excelService.exportAsExcelFile(this.sellingInformationsAllBase, 'all-tickets-sellings-snapshot');
  }

  filtering() {
    console.log('the filter ?', this.sellingInformationsAllBase, this.isWorkingGroup, this.zipSelected.value, this.channelSelected.value, this.sellerNameSelected.value)

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
  }

  changeWorkingGroup() {
    this.isWorkingGroup = !this.isWorkingGroup;
    this.filtering();
  }

}
