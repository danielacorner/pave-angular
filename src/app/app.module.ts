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
import { FilterSliderComponent } from './filter-slider/filter-slider.component';

import { MatButtonModule, MatSliderModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '../../node_modules/@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    VizComponent,
    ColourLegendButtonComponent,
    SizeLegendButtonComponent,
    FilterSliderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSliderModule,
    FormsModule,
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
