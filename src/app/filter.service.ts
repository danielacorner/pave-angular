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
export class FilterService {
  public _url = '../assets/NOC-data.json';
  constructor(private http: HttpClient) { }

  getFilteredData(filterValues): Observable<CircleData[]> {
    const filteredData = this.http.get<CircleData[]>(this._url);
    return filteredData;
  }
}
