import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <app-viz></app-viz>
    <router-outlet></router-outlet>

  `,
  styles: []
})
export class AppComponent {

  constructor() {
  }
}
