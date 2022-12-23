import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  url = '';

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.router.events.subscribe(r => {
      if (r instanceof NavigationEnd) {
        this.url = r.url;
      }
    });
  }

}
