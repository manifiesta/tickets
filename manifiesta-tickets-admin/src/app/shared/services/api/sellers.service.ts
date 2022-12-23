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

  getAllSellingInformation(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}tickets/sellingInformation`);
  }

  getAllSellerSellingInformation(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}tickets/sellingInformation/seller`);
  }

  getAllDepartmentSellingInformation(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}tickets/sellingInformation/department`);
  }

  getAllPhysicalTickets(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}tickets/physicalTickets`);
  }
}
