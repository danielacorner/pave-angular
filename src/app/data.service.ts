import { Injectable } from '@angular/core';
import { HttpClient, /* HttpErrorResponse */ } from '@angular/common/http';
import { CircleData } from './circle-data';
import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { throwError } from 'rxjs';
// import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public _url = ( window.location.href.includes('localhost') ?
    '../assets/NOC-data.json' : '../pave-angular/assets/NOC-data.json' );
  constructor(private http: HttpClient) {}

  getData(): Observable<CircleData[]> {
    return this.http.get<CircleData[]>(this._url);
    // .pipe(map(res => res),
    //   catchError((error: HttpErrorResponse) => {
    //     return Observable.throwError(error.message || 'Server error');
    //   }));
  }
}
