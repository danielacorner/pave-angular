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
import { TooltipMobileComponent } from './tooltip-mobile/tooltip-mobile.component';

// Services
import { DataService } from './data.service';
import { AppStatusService } from './app-status.service';

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
  MatSlideToggleModule,
  MatSelectModule,
  MatBottomSheetModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DetailsComponent } from './details/details.component';
import { GraphModeComponent } from './graph-mode/graph-mode.component';
import { ChangeSizesDropdownComponent } from './change-sizes-dropdown/change-sizes-dropdown.component';
import { ChangeColoursDropdownComponent } from './change-colours-dropdown/change-colours-dropdown.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    VizComponent,
    ColourLegendButtonComponent,
    SizeLegendButtonComponent,
    FilterSliderComponent,
    TooltipComponent,
    DetailsComponent,
    GraphModeComponent,
    ChangeSizesDropdownComponent,
    ChangeColoursDropdownComponent,
    TooltipMobileComponent
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
    MatSlideToggleModule,
    MatSelectModule,
    MatBottomSheetModule,
    FormsModule
  ],
  entryComponents: [DetailsComponent, TooltipMobileComponent],
  providers: [DataService, MatDialogTitle, AppStatusService],
  bootstrap: [AppComponent]
})
export class AppModule {}
