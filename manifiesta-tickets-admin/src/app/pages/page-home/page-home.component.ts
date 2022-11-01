import { Component, OnInit } from '@angular/core';
import { SellersService } from 'src/app/shared/services/api/sellers.service';

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrls: ['./page-home.component.scss']
})
export class PageHomeComponent implements OnInit {

  displayedColumns: string[] = ['email', 'firstName', 'lastName', 'sellTickets'];
  sellers: any[] = [];

  constructor(private sellersService: SellersService) { }

  ngOnInit(): void {
    this.sellersService.getAll().subscribe(data => {
      this.sellers = data;
    });
  }

}
