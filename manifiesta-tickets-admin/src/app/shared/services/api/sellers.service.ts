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
    return this.http.get<any>(
      `${environment.apiUrl}admins/sellingsInformations`,
      { headers: { token: localStorage.getItem('admin-token') as string } }
    );
  }

  getAllSellerSellingInformation(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}admins/sellingsInformations/sellers`,
      { headers: { token: localStorage.getItem('admin-token') as string } }
    );
  }

  getAllDepartmentSellingInformation(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}admins/sellingsInformations/departments`,
      { headers: { token: localStorage.getItem('admin-token') as string } }
    );
  }

  getAllPhysicalTickets(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}admins/physicalTickets`,
      { headers: { token: localStorage.getItem('admin-token') as string } }
    );
  }

  physicalTicketSendDone(id: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}admins/physicalTickets/sendDone/${id}`,
      { headers: { token: localStorage.getItem('admin-token') as string } }
    );
  }
}
