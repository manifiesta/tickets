import { Component, Inject, OnInit } from '@angular/core';
import { SellersService } from 'src/app/shared/services/api/sellers.service';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

@Component({
  selector: 'app-page-order-not-finish',
  templateUrl: './page-order-not-finish.component.html',
  styleUrls: ['./page-order-not-finish.component.scss']
})
export class PageOrderNotFinishComponent implements OnInit {

  displayedSellersColumns: string[] = ['merchantReference', 'date', 'sellerId', 'name', 'email', 'details', 'actions'];
  data: any[] = [];
  sellingInformationsAmountTickets!: number;

  constructor(
    private sellersService: SellersService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.initTable();
  }

  initTable(): void {
    this.sellersService.getOrderNotFinish().subscribe(data => {
      this.data = data;
    });
  }

  finishProcessModal(element: any) {
    console.log('open modal to finish process', element)

    const dialogRef = this.dialog.open(FinishOrderModal, {
      data: element,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The modal was closed')
      this.initTable();
    });
  }

}

@Component({
  selector: 'app-finish-order-modal',
  templateUrl: 'finish-order-modal.html',
})
export class FinishOrderModal {
  constructor(
    public dialogRef: MatDialogRef<FinishOrderModal>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sellersService: SellersService,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  finish() {
    console.log('data ?', this.data)
    this.sellersService.finishOrder(this.data).pipe(
      take(1)
    ).subscribe(data => {
      console.log('ok', data)
      this.dialogRef.close();
    });
  }
}
