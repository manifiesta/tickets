import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  status: string;
  message: string;

  user: any = {};
  progress = 0;

  isLoading = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private http: HttpClient) {
    console.log('hello tab 3')
  }
  
  ionViewDidEnter() {
    console.log(
      'do we have the uri ?',
      this.router.url,
      this.activatedRoute.snapshot.queryParamMap.get('message'),
      this.activatedRoute.snapshot.queryParamMap.get('status'),
    )

    this.status = this.activatedRoute.snapshot.queryParamMap.get('status');
    this.message = this.activatedRoute.snapshot.queryParamMap.get('message');

    if (this.status) {

      this.isLoading = true;
      this.http.post<any>(`${environment.apiUrl}sellers/tickets`, { email: "samy@manifiesta.com" }).subscribe(data => {
        console.log('data ?', data.email, data.sellTickets, data.sellTicketsGoal)
        this.user = data;
        setInterval(() => {
          if (this.progress < (this.user.sellTickets / this.user.sellTicketsGoal)) {
            this.progress += 0.05;
          }
        }, 50);
      }).add(() => { this.isLoading = false; });
    
    }
  }

}
