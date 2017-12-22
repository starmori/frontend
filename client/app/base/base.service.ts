/**
 * Base Service
 * Takes care of setting common headers
 * and catching errors
 */
import { Http, Headers, RequestOptionsArgs, Response, ResponseOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { API } from './../config/api/index';
import { CPObj, appStorage } from '../shared/utils';

const buildCommonHeaders = () => {
  const auth = `${API.AUTH_HEADER.SESSION} ${appStorage.get(appStorage.keys.SESSION)}`;

  return new Headers({
    'Content-Type': 'application/json',
    'Authorization': auth
  });
};

@Injectable()
export abstract class BaseService {
  constructor(
    private http: Http,
    private router: Router
  ) { }

  private waitAndRetryThreeTimes(err): Observable<any> {
    let retries = 3;

    console.log(err);

    return err
      .delay(1200)
      .flatMap(e => {
        if (retries > 0) {
          retries -= 1;
          return Observable.of(e);
        }
        return Observable.throw(e);
      })
  }

  get(url: string, opts?: RequestOptionsArgs) {
    const headers = buildCommonHeaders();

    return this
      .http
      .get(url, { headers, ...opts })
      .retryWhen(err => this.waitAndRetryThreeTimes(err))
      .catch(err => {
        if (err.status === 403) {
          return Observable.of(
            new Response(
              new ResponseOptions({ body: JSON.stringify([]) })
            )
          )
        }
        return this.catchError(err);
      });
  }

  post(url: string, data: any, opts?: RequestOptionsArgs) {
    const headers = buildCommonHeaders();

    data = CPObj.cleanNullValues(data);

    return this
      .http
      .post(url, data, { headers, ...opts })
      .retryWhen(err => this.waitAndRetryThreeTimes(err))
      .catch(err => this.catchError(err));
  }

  update(url: string, data: any, opts?: RequestOptionsArgs, silent = false) {
    const headers = buildCommonHeaders();

    data = CPObj.cleanNullValues(data);

    return this
      .http
      .put(url, data, { headers, ...opts })
      .retryWhen(err => this.waitAndRetryThreeTimes(err))
      .catch(err => silent ? Observable.throw(err) : this.catchError(err));
  }

  delete(url: string, opts?: RequestOptionsArgs, silent = false) {
    const headers = buildCommonHeaders();

    return this
      .http
      .delete(url, { headers, ...opts })
      .retryWhen(err => this.waitAndRetryThreeTimes(err))
      .catch(err => silent ? Observable.throw(err) : this.catchError(err));
  }

  catchError(err) {
    switch (err.status) {
      case 401:
        appStorage.clear();
        this.router.navigate(['/login']);
        break;

      case 404:
        this.router.navigate(['/dashboard']);
        break;

      case 403:
        this.router.navigate(['/dashboard']);
        break;

      case 500:
        this.router.navigate(['/dashboard']);
        break;

      default:
        return Observable.throw(err);
    }
  }
}
