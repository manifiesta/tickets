import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private router: Router, private zone: NgZone) {
    this.initializeApp();
  }

  initializeApp() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(() => {
        // Example url: https://beerswift.app/tabs/tab2
        // slug = /tabs/tab2
        console.log('hrllo slug event url', event.url)
        const slug = event.url.includes('mycallbackscheme://result');
        // Expected url call back
        // mycallbackscheme://result?action=sale&amount=101&clientTransactionId=&message=(-4) USER_CANCEL&status=fail&tid=16220044
        if (slug || event.url === 'result') {
          console.log('we are ok with the first step', slug)
          this.router.navigateByUrl(event.url.replace('mycallbackscheme://', '/tabs/'));
          // this.router.navigateByUrl('/tabs/tab3');
        }
        // If no match, do nothing - let regular routing
        // logic take over
      });
    });
  }
}
