import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';

import { Observable, of, EMPTY } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LoginService } from './services/communication/login.service';

@Injectable({
  providedIn: 'root'
})
export class LoginResolver implements Resolve<Observable<boolean>> {
  constructor(private loginService: LoginService, private router: Router) { }
  
  resolve(): Observable<boolean> {
    if (!this.loginService.getToken()) {
      this.router.navigate(['/login']);
      return EMPTY;
    }
    return of(true);
  }
}
