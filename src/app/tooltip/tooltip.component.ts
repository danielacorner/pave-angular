import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, } from '@angular/material';
import * as d3 from 'd3';
import { DetailsComponent } from '../details/details.component';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material';

@Component({
  selector: 'app-tooltip',
  template: `

<div id="tooltip" class="tooltip z-depth-3"
  [style.top]="(tooltipY + 595 > windowInnerHeight && headerOpenState ? null : tooltipY - 173 + 'px')"
  [style.bottom]="(tooltipY + 595 > windowInnerHeight && headerOpenState ? '20px' : null)"
  [style.left]="(tooltipX > windowInnerWidth * 0.5 ? tooltipX - 360 - circleR + 'px' : tooltipX + circleR + 'px')"
  [style.pointerEvents]="(expanded ? 'auto' : 'none')"
  [style.display]="(windowInnerWidth < this.mobileBreakPoint ? 'none' : 'inline')"
  >
    <mat-card
    >
          <mat-card-header>
            <div mat-card-avatar class="header-image"></div>
            <mat-card-title>{{data.job}}</mat-card-title>
            <mat-card-subtitle>{{data.sector}}</mat-card-subtitle>
          </mat-card-header>
    </mat-card>
    <mat-accordion>

    <!-- PANEL 1 -->
    <mat-expansion-panel
    class="panel panel-1"
    [ngStyle]="headerStyles"
    [style.paddingBottom]="(headerOpenState ? '0px' : '20px')"
    [expanded]="expanded"
    (opened)="tooltipOpened($event)"
    (closed)="headerOpenState = false;
    hideOnExpanded = 'block';"
    >
      <mat-expansion-panel-header [style.display]="hideOnExpanded">
                <p>
                  Here is a very brief job description; it could be roughly 100 characters.
                </p>
      </mat-expansion-panel-header>

      <img mat-card-image [src]="wdw.location.href.includes('localhost')
      ? '../../assets/img/NOC_images/' + data.noc + '.jpg'
      : '../../pave-angular/assets/img/NOC_images/' + data.noc + '.jpg'"
      alt="Photo of {{data.job}}">
        <p>
          Here is a longer job description; it could be roughly 250 characters.
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
        </p>

      <mat-action-row class="btn-row">
        <button (click)="openDetails(data)" mat-button> <mat-icon class="btn-icon blue-icon">info</mat-icon>
        LEARN MORE</button>
        <button mat-button> <mat-icon class="btn-icon orange-icon">star</mat-icon>
        FAVOURITE</button>
      </mat-action-row>

    </mat-expansion-panel>
    <!-- PANEL 2 -->
    <mat-expansion-panel class="panel">
                <p>
                  Here is a brief job description; it could be roughly 250 characters.
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                </p>
    </mat-expansion-panel>
    <!-- PANEL 3 -->
    <mat-expansion-panel class="panel">
                  <p>
                  Here is a brief job description; it could be roughly 250 characters.
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                </p>
    </mat-expansion-panel>

  </mat-accordion>
</div>

  `,
  styleUrls: ['tooltip.component.scss']
})
export class TooltipComponent implements OnInit, OnDestroy {
  @Input() public tooltipData;
  @Input() public expanded = false;
  @Input() mobileBreakPoint;
  public wdw = window;
  public data; // shortcut to access tooltipData.d.all
  public tooltipHeight;
  public tooltipX;
  public tooltipY;
  public circleR;
  public headerOpenState = false;
  public hideOnExpanded = 'block';
  public headerStyles = {
    marginBottom: '0px'
    // paddingTop: '20px',
  };
  public windowInnerHeight = window.innerHeight;
  public windowInnerWidth = window.innerWidth;

  constructor(public dialog: MatDialog, private bottomSheet: MatBottomSheet) {}

  ngOnInit() {
    this.data = this.tooltipData.d.all;
    this.tooltipInit(
      this.tooltipData.d,
      this.tooltipData.x,
      this.tooltipData.y
    );
    // console.log(this.tooltipData.d.all);
  }

  ngOnDestroy(): void {}

  tooltipInit(d, x, y) {
    this.tooltipY = y;
    this.tooltipX = x;
    this.circleR = d.r;
    const that = this;
    // set avatar image
    d3.select('.header-image').style(
      'background-image',
      window.location.href.includes('localhost')
        ? 'url("../../assets/img/NOC_images/' +
          this.tooltipData.d.all.noc +
          '.jpg"'
        : 'url("../../pave-angular/assets/img/NOC_images/' +
          this.tooltipData.d.all.noc +
          '.jpg"'
    );
  }

  tooltipOpened(event) {
    if (window.innerWidth < this.mobileBreakPoint) {
      this.openBottomSheetMobile();
    } else {
      this.headerOpenState = true;
      this.hideOnExpanded = 'none';
    }
  }

  openDetails(jobData): void {
    if (window.innerWidth < this.mobileBreakPoint) {
      return;
    } else {
      // const dialogRef =
      this.dialog.open(DetailsComponent, {
        height: '95%',
        width: 'auto',
        data: jobData
      });
    }
  }

  openBottomSheetMobile() {
    // const bottomSheetRef =
    this.bottomSheet.open(BottomSheetMobileTooltipComponent, {
      data: { tooltipData: this.tooltipData }
    });
  }
}

@Component({
  selector: 'app-bottom-sheet-mobile-tooltip',
  template: `
  <div class="container">
   <mat-card
    >
          <mat-card-header>
            <div mat-card-avatar class="header-image"></div>
            <mat-card-title>{{data.job}}</mat-card-title>
            <mat-card-subtitle>{{data.sector}}</mat-card-subtitle>
          </mat-card-header>
    </mat-card>
    <mat-accordion>

    <!-- PANEL 1 -->
    <mat-expansion-panel
    class="panel panel-1"
    [expanded]="expanded"
    (closed)="headerOpenState = false;
    hideOnExpanded = 'block';"
    >
      <mat-expansion-panel-header>
                <p>
                  Here is a very brief job description; it could be roughly 100 characters.
                </p>
      </mat-expansion-panel-header>

      <img mat-card-image [src]="wdw.location.href.includes('localhost')
      ? '../../assets/img/NOC_images/' + data.noc + '.jpg'
      : '../../pave-angular/assets/img/NOC_images/' + data.noc + '.jpg'"
      alt="Photo of {{data.job}}">
        <p>
          Here is a longer job description; it could be roughly 250 characters.
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
        </p>

      <mat-action-row>
        <button (click)="openDetails(data)" mat-button> <mat-icon class="btn-icon blue-icon">info</mat-icon>
        LEARN MORE</button>
        <button mat-button> <mat-icon class="btn-icon orange-icon">star</mat-icon>
        FAVOURITE</button>
      </mat-action-row>

    </mat-expansion-panel>
    <!-- PANEL 2 -->
    <mat-expansion-panel class="panel">
                <p>
                  Here is a brief job description; it could be roughly 250 characters.
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                </p>
    </mat-expansion-panel>
    <!-- PANEL 3 -->
    <mat-expansion-panel class="panel">
                  <p>
                  Here is a brief job description; it could be roughly 250 characters.
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                </p>
    </mat-expansion-panel>

  </mat-accordion>
  </div>
  `
})
export class BottomSheetMobileTooltipComponent implements OnInit {
  constructor(
    private bottomSheetRef: MatBottomSheetRef<BottomSheetMobileTooltipComponent>
  ) {}
  public data;
  public wdw = window;
  public expanded = true;
  @Input() tooltipData;

  ngOnInit() {
    this.data = this.tooltipData.d.all;
  }
  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  openDetails(jobData): void {
      // const dialogRef =
      // this.dialog.open(DetailsComponent, {
      //   height: '95%',
      //   width: 'auto',
      //   data: jobData
      // });
    }
  }
}
