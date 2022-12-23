import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageDepartmentsComponent } from './pages/page-departments/page-departments.component';
import { PageHomeComponent } from './pages/page-home/page-home.component';
import { PagePhysicalTicketsComponent } from './pages/page-physical-tickets/page-physical-tickets.component';
import { PageSellerComponent } from './pages/page-seller/page-seller.component';

const routes: Routes = [
  { path: 'home', component: PageHomeComponent },
  { path: 'departments', component: PageDepartmentsComponent },
  { path: 'sellers', component: PageSellerComponent },
  { path: 'physical-tickets', component: PagePhysicalTicketsComponent },

  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
