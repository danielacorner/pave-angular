import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatBottomSheet,
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA
} from '@angular/material';
import { ModalComponent } from '../modal/modal.component';
import * as d3 from 'd3';

@Component({
  selector: 'app-tooltip-mobile',
  templateUrl: 'tooltip-mobile.component.html',
  styles: [
    `
      .header-image-mobile {
        height: 72px;
        width: 72px;
        background-size: cover;
        top: 5px;
        right: 5px;
      }
      .titlelistitem div {
        margin: 5px 20px 5px 5px;
      }
      .mat-bottom-sheet-container {
        padding: 0;
      }
      mat-action-row {
        justify-content: flex-center;
      }
    `
  ]
})
export class TooltipMobileComponent implements OnInit {
  constructor(
    private bottomSheetRef: MatBottomSheetRef<TooltipMobileComponent>,
    public dialog: MatDialog,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {}
  public wdw = window;
  public expanded = false;

  ngOnInit() {
    d3.select('.header-image-mobile').style(
      'background-image',
      window.location.href.includes('localhost')
        ? 'url("../../assets/img/NOC_thumbnails/tn_' +
          this.data.ttdata.noc +
          '.jpg"'
        : 'url("../../pave-angular/assets/img/NOC_thumbnails/tn_' +
          this.data.ttdata.noc +
          '.jpg"'
    );
    d3.select('.mat-bottom-sheet-container').style('overflow', 'hidden');
  }

  // openLink(event: MouseEvent): void {
  //   this.bottomSheetRef.dismiss();
  //   event.preventDefault();
  // }

  openDetails(jobData): void {
    // drag-up bottom sheet
  }
}
