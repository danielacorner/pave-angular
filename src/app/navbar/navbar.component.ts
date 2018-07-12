import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  template: `
   <nav>
      <div class="nav-wrapper grey lighten-4">
        <a href="#" data-target="nav-mobile" class="sidenav-trigger hide-on-med-and-up"><i class="material-icons">menu</i></a>

        <ul id="nav-desktop" class="hide-on-small-only">
          <li><a routerLink="/" exact class="left brand">Pave</a></li>
          <li><a routerLink="/about" exact>About</a></li>
          <li><a routerLink="/help" exact>Help</a></li>
          <li><a routerLink="/feedback" exact>Feedback</a></li>
        <!-- search box -->
        <li class="right"><a class="btn waves-effect waves-light">search</a></li>
        <li class="right"><form>
          <div class="input-field">
            <input type="search" id="search" required/>
            <i class="prefix label-icon material-icons green-text">search</i>
            <label id="search-label" for="search" class="">Search jobs...</label>
            <i class="material-icons">close</i>
          </div>
        </form></li>
        </ul>

        <ul id="nav-mobile" class="sidenav">
          <li><a routerLink="/" exact class="brand">Pave</a></li>
          <li><a routerLink="/about" exact>About</a></li>
          <li><a routerLink="/help" exact>Help</a></li>
          <li><a routerLink="/feedback" exact>Feedback</a></li>          <li> <a href="#">Contact</a> </li>
        </ul>
      </div>
   </nav>
     `,
  styles: [
    `
      ul {
        list-style-type: none;
        text-align: center;
        /* margin: 0; */
      }

      .sidenav li {
        display: block;
      }
      a:not(.btn) {
        font-family: "Raleway";
        color: #27ae60;
        text-decoration: none;
        /* padding: 6px 8px; */
        /* border-radius: 10px; */
      }
      .brand {
        font-size: 32px;
      }
      nav {
        background: #eee;
        /* padding: 14px 0; */
        /* margin-bottom: 40px; */
      }
      .router-link-active {
        background: #eee;
        color: #3c8d44;
      }
      input#search {
        height: 64px;
      }
      #search-label {
        margin: -12px 0 0 50px;
        font-size: 16px;
        /* color: #27AE60; */
      }
      #search-label.active {
        margin: -2px 0 0 50px;
      }
      form div {
      }
    `
  ]
})
export class NavbarComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    $(document).ready(function() {
      $('.sidenav').sidenav();
    });
  }
}
