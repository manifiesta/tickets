import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageDepartmentsComponent } from './pages/page-departments/page-departments.component';
import { PageHomeComponent } from './pages/page-home/page-home.component';
import { PageLoginComponent } from './pages/page-login/page-login.component';
import { PagePhysicalTicketsComponent } from './pages/page-physical-tickets/page-physical-tickets.component';
import { PageSellerComponent } from './pages/page-seller/page-seller.component';
import { LoginResolver } from './shared/login.resolver';
import { PageOrderNotFinishComponent } from './pages/page-order-not-finish/page-order-not-finish.component';
import { PageSellingsTicketsComponent } from './pages/page-sellings-tickets/page-sellings-tickets.component';
import { PageLongTextComponent } from './pages/page-volunteer/page-volunteer.component';

const routes: Routes = [
  { path: 'home', component: PageHomeComponent, resolve: { login: LoginResolver } },
  { path: 'departments', component: PageDepartmentsComponent, resolve: { login: LoginResolver } },
  { path: 'sellings-tickets', component: PageSellingsTicketsComponent, resolve: { login: LoginResolver } },
  { path: 'sellers', component: PageSellerComponent, resolve: { login: LoginResolver } },
  { path: 'physical-tickets', component: PagePhysicalTicketsComponent, resolve: { login: LoginResolver } },
  { path: 'order-not-finish', component: PageOrderNotFinishComponent, resolve: { login: LoginResolver } },
  { path: 'longtext', component: PageLongTextComponent, resolve: { login: LoginResolver } },
  { path: 'login', component: PageLoginComponent },

  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
