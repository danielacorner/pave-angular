// Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

// Components
import { AppComponent } from './app.component';
// Main page
import { NavbarComponent } from './navbar/navbar.component';
import { VizComponent } from './viz/viz.component';
import { TooltipComponent } from './details/tooltip/tooltip.component';
import { TooltipMobileComponent } from './details/tooltip-mobile/tooltip-mobile.component';
import { ModalComponent } from './details/modal/modal.component';
// Other pages
import { ContactComponent } from './pages/contact.component';
import { AboutComponent } from './pages/about.component';
import { DetailsComponent } from './pages/details.component';
// Controls
import { ColourSortButtonComponent } from './controls/colour-sort-button.component';
import { SizeSortButtonComponent } from './controls/size-sort-button.component';
import { FilterSliderComponent } from './controls/filter-slider.component';
import { GraphModeComponent } from './controls/graph-mode.component';
import { ChangeSizesDropdownComponent } from './controls/change-sizes-dropdown.component';
import { ChangeColoursDropdownComponent } from './controls/change-colours-dropdown.component';

// Services
import { DataService } from './services/data.service';
import { AppStatusService } from './services/app-status.service';
import { MatDialogTitle } from '@angular/material';

// Material
import { MaterialModule } from './material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StaticChartComponent } from './viz/static-chart/static-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    VizComponent,
    ColourSortButtonComponent,
    SizeSortButtonComponent,
    FilterSliderComponent,
    TooltipComponent,
    ModalComponent,
    GraphModeComponent,
    ChangeSizesDropdownComponent,
    ChangeColoursDropdownComponent,
    TooltipMobileComponent,
    AboutComponent,
    DetailsComponent,
    ContactComponent,
    StaticChartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule
  ],
  entryComponents: [ModalComponent, TooltipMobileComponent],
  providers: [DataService, MatDialogTitle, AppStatusService],
  bootstrap: [AppComponent]
})
export class AppModule {}
