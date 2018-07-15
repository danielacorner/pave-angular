import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';

import * as $ from 'jquery';
import { VizComponent } from './viz/viz.component';

import { DataService } from './data.service';
import { HttpClientModule } from '@angular/common/http';
import { ColourLegendButtonComponent } from './colour-legend-button/colour-legend-button.component';
import { SizeLegendButtonComponent } from './size-legend-button/size-legend-button.component';
import { MatButtonModule } from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    VizComponent,
    ColourLegendButtonComponent,
    SizeLegendButtonComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatButtonModule,
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
