import { NgModule } from '@angular/core';

import {
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
  MatMenuModule
} from '@angular/material';

@NgModule({
  imports: [
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
    MatMenuModule
  ],
  exports: [
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
    MatMenuModule
  ]
})
export class MaterialModule {}
