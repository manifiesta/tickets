import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageHomeComponent } from './pages/page-home/page-home.component';
import { PageSellerComponent } from './pages/page-seller/page-seller.component';

const routes: Routes = [
  { path: 'home', component: PageHomeComponent },
  { path: 'sellers', component: PageSellerComponent },

  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
