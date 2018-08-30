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
  MatMenuModule,
  MatListModule
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
    MatMenuModule,
    MatListModule
  ],
  exports: [
    // todo: export all imports
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
    MatListModule
  ]
})
export class MaterialModule {}
