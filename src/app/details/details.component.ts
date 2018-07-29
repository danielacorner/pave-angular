import { Component, Input, OnInit, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatTabsModule,
  MatDialogTitle,
  MatDividerModule
} from '@angular/material';

@Component({
  selector: 'app-details',
  template: `
  <div class="details-container">

    <div class="details">

      <div class="title-container">
        <h1 mat-dialog-title class="title">{{data.job}}</h1>
        <h3 mat-dialog-title class="subtitle right-align">{{data.sector}}</h3>
      </div>

      <div mat-dialog-content>

        <div class="header-img-div">
          <img class="header-image"
          [src]="(wdw.location.href.includes('localhost')
          ? '../../assets/img/NOC_images/' + data.noc + '.jpg'
          : '../../pave-angular/assets/img/NOC_images/' + data.noc + '.jpg')"
          style="object-fit: cover">
        </div>

        <mat-tab-group mat-stretch-tabs>
          <mat-tab label="Can I do this">
          Content 1
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          </mat-tab>
          <mat-tab label="Should I do this">
          Content 2
          </mat-tab>
          <mat-tab label="How do I do this">
          Content 3
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <mat-divider></mat-divider>

    <div class="button-row">
    <a target="_blank" href="{{data.siteLink}}" mat-button color="primary">
    OPEN <mat-icon class="menu-icon">open_in_new</mat-icon></a>
    <a target="_blank" href="{{data.siteLink}}" mat-button color="accent">
    FAVOURITE <mat-icon class="menu-icon">star</mat-icon></a>
    </div>

  </div>


    `,
  styles: [
    `
      .details-container {
        height: 100%;
        position: relative;
      }
      .details {
        max-height: 95%;
        height: 94%;
      }
      .mat-dialog-content {
        max-height: 77.7vh;
      }
      .header-img-div {
      }
      .title-container {
        height: 7vh;
      }
      .title {
        margin-bottom: 0;
      }
      .subtitle {
        position: absolute;
        top: 32px;
        right: 0;
        font-size: 12px;
      }
      .header-image {
        height: 30vh;
        display: flex;
        justify-content: center;
        margin: auto;
      }
      .button-row {
        position: absolute;
        bottom: 0;
        right: 0;
      }
      mat-icon {
        margin-bottom: 3px;
      }
    `
  ]
})
export class DetailsComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}
  public wdw = window;

  ngOnInit() {
    // console.log(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
