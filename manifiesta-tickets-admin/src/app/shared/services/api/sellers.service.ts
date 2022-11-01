import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SellersService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}sellers`);
  }

  addTicketOne(): Observable<any> {
    return this.http.get<any>(`https://manifiesta-tickets-backend.vercel.app/api/sellers/tickets/samy@manifiesta.com`);
  }
}
