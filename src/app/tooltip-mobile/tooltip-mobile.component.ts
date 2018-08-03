import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DetailsComponent } from '../details/details.component';
import * as d3 from 'd3';
import {
  MatBottomSheet,
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA
} from '@angular/material';

@Component({
  selector: 'app-tooltip-mobile',
  template: `
   <mat-card>
    <mat-card-header>
      <div mat-card-avatar class="header-image-mobile"></div>
      <mat-card-title>"{{data.ttdata.job}}"</mat-card-title>
      <mat-card-subtitle>"{{data.ttdata.sector}}"</mat-card-subtitle>
    </mat-card-header>
  </mat-card>

  <mat-accordion>
    <!-- PANEL 1 -->
    <mat-expansion-panel
    class="panel panel-1"
    [expanded]="expanded"
    >
      <mat-expansion-panel-header>
                <p>
                  Here is a very brief job description; it could be roughly 100 characters.
                </p>
      </mat-expansion-panel-header>

      <img mat-card-image [src]="(wdw.location.href.includes('localhost')
      ? '../../assets/img/NOC_images/' + data.ttdata.noc + '.jpg'
      : '../../pave-angular/assets/img/NOC_images/' + data.ttdata.noc + '.jpg')"
      alt="Photo of {{data.ttdata.job}}">
        <p>
          Here is a longer job description; it could be roughly 250 characters.
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
        </p>

      <mat-action-row>
        <button (click)="openDetails(data.ttdata)" mat-button> <mat-icon class="btn-icon blue-icon">info</mat-icon>
        LEARN MORE</button>
        <button mat-button> <mat-icon class="btn-icon orange-icon">star</mat-icon>
        FAVOURITE</button>
      </mat-action-row>

    </mat-expansion-panel>
    <!-- PANEL 2 -->
    <mat-expansion-panel class="panel" [expanded]="false">
      <mat-expansion-panel-header>
        <mat-panel-title>
          What to study
        </mat-panel-title>
        <mat-panel-description>
          Programs, courses, scholarships, tuition
        </mat-panel-description>
      </mat-expansion-panel-header>
                <p>
                  Here are details about the program of study, such as courses, timeline, tuition,
                  scholarships...
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                </p>
    </mat-expansion-panel>
    <!-- PANEL 3 -->
    <mat-expansion-panel class="panel">
      <mat-expansion-panel-header>
        <mat-panel-title>
          Where to study
        </mat-panel-title>
        <mat-panel-description>
          Schools offering this program of study
        </mat-panel-description>
      </mat-expansion-panel-header>
                <p>
                  Here are details about schools offering this program of study.
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                </p>
    </mat-expansion-panel>

  </mat-accordion>
  `,
  styles: [
    `
      .header-image-mobile {
        height: 72px;
        width: 72px;
        background-size: cover;
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
        ? 'url("../../assets/img/NOC_thumbnails/tn_' + this.data.ttdata.noc + '.jpg"'
        : 'url("../../pave-angular/assets/img/NOC_thumbnails/tn_' +
          this.data.ttdata.noc +
          '.jpg"'
    );
    console.log(d3.select('.header-image-mobile'));
  }

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  openDetails(jobData): void {
    const dialogRef = this.dialog.open(DetailsComponent, {
      height: '95%',
      width: 'auto',
      data: jobData
    });
  }
}
