import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { PageSellerComponent } from './pages/page-seller/page-seller.component';
import { PageHomeComponent } from './pages/page-home/page-home.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PagePhysicalTicketsComponent } from './pages/page-physical-tickets/page-physical-tickets.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PageDepartmentsComponent } from './pages/page-departments/page-departments.component';

@NgModule({
  declarations: [
    AppComponent,
    PageSellerComponent,
    PageHomeComponent,
    PagePhysicalTicketsComponent,
    PageDepartmentsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // Ng Material stuff
    MatToolbarModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  providers: [
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'fill'}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
