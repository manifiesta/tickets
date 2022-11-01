import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  status: string;
  message: string;

  progress = 0;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    console.log('hello tab 3')

    setInterval(() => {
      if (this.progress < 0.75) {
        this.progress += 0.05;
      }
      // Reset the progress bar when it reaches 100%
      // to continuously show the demo
      // if (this.progress > 0.75) {
      //   setTimeout(() => {
      //     this.progress = 0;
      //   }, 1000);
      // }
    }, 50);
  }
  
  ionViewDidEnter() {
    console.log(
      'do we have the uri ?',
      this.router.url,
      this.activatedRoute.snapshot.queryParamMap.get('message'),
      this.activatedRoute.snapshot.queryParamMap.get('status'),
      this.activatedRoute.snapshot.queryParamMap.toString(),
    )

    this.status = this.activatedRoute.snapshot.queryParamMap.get('status');
    this.message = this.activatedRoute.snapshot.queryParamMap.get('message');
  }

}
