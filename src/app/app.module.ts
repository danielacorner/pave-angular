// Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

// Components
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { VizComponent } from './viz/viz.component';
import { ColourLegendButtonComponent } from './controls/colour-legend-button/colour-legend-button.component';
import { SizeLegendButtonComponent } from './controls/size-legend-button/size-legend-button.component';
import { FilterSliderComponent } from './controls/filter-slider/filter-slider.component';
import { TooltipComponent } from './details/tooltip/tooltip.component';
import { TooltipMobileComponent } from './details/tooltip-mobile/tooltip-mobile.component';

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
  MatBottomSheetModule,
  MatMenuModule,
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalComponent } from './details/modal/modal.component';
import { GraphModeComponent } from './controls/graph-mode/graph-mode.component';
import { ChangeSizesDropdownComponent } from './controls/change-sizes-dropdown/change-sizes-dropdown.component';
import { ChangeColoursDropdownComponent } from './controls/change-colours-dropdown/change-colours-dropdown.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    VizComponent,
    ColourLegendButtonComponent,
    SizeLegendButtonComponent,
    FilterSliderComponent,
    TooltipComponent,
    ModalComponent,
    GraphModeComponent,
    ChangeSizesDropdownComponent,
    ChangeColoursDropdownComponent,
    TooltipMobileComponent,
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
    MatMenuModule,
    FormsModule,
  ],
  entryComponents: [ModalComponent, TooltipMobileComponent],
  providers: [DataService, MatDialogTitle, AppStatusService],
  bootstrap: [AppComponent]
})
export class AppModule {}
