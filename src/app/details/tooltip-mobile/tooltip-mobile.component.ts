import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
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
  // appDraggable dragHandle=".mat-bottom-sheet-container" dragTarget=".mat-bottom-sheet-container"
  template: `
  <mat-list role="list"
  >
    <div class="titlelist">

    <a class="btn-floating btn-large halfway-fab header-image-mobile">
    </a>
    <mat-list-item role="listitem" class="titlelistitem purple white-text">
      {{data.ttdata.job | titlecase}}
    </mat-list-item>
    <mat-list-item role="listitem" class="subtitlelistitem white grey-text">
    {{data.ttdata.sector}}
    </mat-list-item>
    <mat-list-item role="listitem" class="descriptionlistitem white">
    Here is a very brief job description; it could be roughly 100 characters.
    </mat-list-item>

    <mat-list-item role="listitem" class="buttonslistitem white">

        <button (click)="openDetails(data.ttdata)" mat-button>
        <mat-icon class="btn-icon blue-icon">info</mat-icon>
        <span btn-text>LEARN MORE</span>
        </button>

        <button mat-button>
        <mat-icon class="btn-icon orange-icon">star</mat-icon>
        <span btn-text>FAVOURITE</span>
        </button>

    </mat-list-item>

    </div>

    <mat-divider></mat-divider>


<mat-card>

  <img mat-card-image [src]="(wdw.location.href.includes('localhost')
      ? '../../assets/img/NOC_images/' + data.ttdata.noc + '.jpg'
      : '../../pave-angular/assets/img/NOC_images/' + data.ttdata.noc + '.jpg')" alt="Photo of {{data.ttdata.job}}">
  <p>
    Here is a longer job description; it could be roughly 250 characters. Lorem Ipsum is simply dummy text of the printing and
    typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
  </p>



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
      Here are details about the program of study, such as courses, timeline, tuition, scholarships... Lorem Ipsum is simply dummy
      text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the
      1500s,
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
      Here are details about schools offering this program of study. Lorem Ipsum is simply dummy text of the printing and typesetting
      industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
    </p>
  </mat-expansion-panel>
</mat-card>

</mat-list>

`,
  styles: [
    `
      .header-image-mobile {
        height: 72px;
        width: 72px;
        background-size: cover;
        top: 5px;
        right: 5px;
        pointer-events: none;
      }
      .titlelistitem {
        min-height: 45px;
        height: auto;
        text-shadow: 1px 1px rgba(0,0,0,0.4)
        box-shadow: 0 8px 10px -5px rgba(0,0,0,.2), 0 16px 24px 2px rgba(0,0,0,.14), 0 6px 30px 5px rgba(0,0,0,.12)
      }
      .titlelistitem div {
        margin: 5px 20px 5px 5px;
      }
      .subtitlelistitem {
        font-size: 12px;
      }
    `
  ]
})
export class TooltipMobileComponent implements OnInit, OnDestroy {
  constructor(
    private bottomSheetRef: MatBottomSheetRef<TooltipMobileComponent>,
    public dialog: MatDialog,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {}
  public wdw = window;
  public expanded = false;

  private scrollListener;

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

    // todo: move these to global scss file
    // d3.select('body, html').style('overflow-y', 'visible');
    // d3.select('body').style('overflow', 'visible');

    d3.select('.mat-bottom-sheet-container')
      // .style('overflow', 'hidden')
      .style('padding', 0)
      .style('height', '100vh')
      .style('max-height', '100vh')
      // .style('position', 'absolute')
      .style('left', '0px')
      .style(
        'top',
        `${window.innerHeight -
          document.querySelector('.titlelist').getBoundingClientRect().height -
          100}px`
      )
      .style('box-shadow', 'none')
      .style('background-color', 'rgba(0,0,0,0)')
      .on('click', () => {
        // dismiss if clicking outside of the tooltip
        if (
          Array.from(d3.event.target.classList).includes(
            'mat-bottom-sheet-container'
          )
        ) {
          this.bottomSheetRef.dismiss();
        }
      });

    const marginTop =
      window.innerHeight -
      document.querySelector('.titlelist').getBoundingClientRect().height -
      100;

    d3.select('.header-image-mobile').style('margin-top', `${marginTop}px`);
    d3.select('.mat-list').style('margin-top', `${marginTop}px`);

    d3.selectAll('mat-list-item .white')
      .style('height', 'auto')
      .style('padding-top', '11px');

    d3.select('.titlelistitem div')
      .style('margin-top', '32px')
      .style('padding', '11px 80px 11px 16px');

    d3.select('.titlelistitem')
      .style('min-height', '45px')
      .style('height', 'auto')
      .style('text-shadow', '1px 1px rgba(0,0,0,0.4)')
      .style(
        'box-shadow',
        '0 8px 10px -5px rgba(0,0,0,.2), 0 16px 24px 2px rgba(0,0,0,.14), 0 6px 30px 5px rgba(0,0,0,.12)'
      );

    d3.select('.buttonslistitem div')
      .style('justify-content', 'center')
      .style('padding', '11px 16px');

    d3.select('.mat-list')
      .selectAll('.mat-button-wrapper')
      .style('display', 'grid')
      .style('grid-template-columns', 'auto auto')
      .selectAll('*')
      .style('margin', 'auto');

    d3.selectAll('[btn-text]').style('margin-left', '4px');
  }

  scrollTooltip(e) {
    console.log(e);
  }

  // todo: draggable directive ends at max bottomsheet height -- or revert to scroll behaviour?

  // todo: "learn more" button transitions up the bottomsheet to full screen
  // todo: title gets sticks at top
  // todo: avatar image shrinks at top
  // openLink(event: MouseEvent): void {
  //   this.bottomSheetRef.dismiss();
  //   event.preventDefault();
  // }
  ngOnDestroy(): void {
    // window.removeEventListener('scroll', this.scrollListener);
  }

  openDetails(jobData): void {
    // drag-up bottom sheet
  }
}
