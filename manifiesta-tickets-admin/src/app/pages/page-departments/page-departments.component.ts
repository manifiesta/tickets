import { Component, OnInit } from '@angular/core';
import { SellersService } from 'src/app/shared/services/api/sellers.service';

@Component({
  selector: 'app-page-departments',
  templateUrl: './page-departments.component.html',
  styleUrls: ['./page-departments.component.scss']
})
export class PageDepartmentsComponent implements OnInit {

  displayedDepartmentColumns: string[] = ['departmentId', 'department', 'details', 'quantity'];
  sellerDepartmentInformationsAll: any[] = [];
  sellingInformationsAmountTickets!: number;

  constructor(private sellersService: SellersService) { }

  ngOnInit(): void {
    this.sellersService.getAllDepartmentSellingInformation().subscribe(data => {
      this.sellerDepartmentInformationsAll = data.data;
      this.sellingInformationsAmountTickets = data.totalAmountTicket;
      console.log('seller selling informations', this.sellerDepartmentInformationsAll, this.sellingInformationsAmountTickets)
    });
  }

}
