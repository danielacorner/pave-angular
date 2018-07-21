// Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '../../node_modules/@angular/forms';
import { AppRoutingModule } from './app-routing.module';

// Components
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { VizComponent } from './viz/viz.component';
import { ColourLegendButtonComponent } from './colour-legend-button/colour-legend-button.component';
import { SizeLegendButtonComponent } from './size-legend-button/size-legend-button.component';
import { FilterSliderComponent } from './filter-slider/filter-slider.component';
import { TooltipComponent } from './tooltip/tooltip.component';

// Services
import { DataService } from './data.service';

// Material
import {
  MatButtonModule,
  MatSliderModule,
  MatTooltipModule,
  MatExpansionModule,
  MatIconModule,
  MatCardModule,
  MatDialogModule,
  MatTabsModule,
  MatDialogTitle,
  MatDividerModule,
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DetailsComponent } from './details/details.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    VizComponent,
    ColourLegendButtonComponent,
    SizeLegendButtonComponent,
    FilterSliderComponent,
    TooltipComponent,
    DetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSliderModule,
    MatTooltipModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatTabsModule,
    MatDividerModule,
    FormsModule
  ],
  entryComponents: [DetailsComponent],
  providers: [DataService, MatDialogTitle],
  bootstrap: [AppComponent]
})
export class AppModule {}
