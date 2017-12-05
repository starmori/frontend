import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, URLSearchParams } from '@angular/http';

import { API } from '../../../config/api';
import { BaseService } from '../../../base/index';

@Injectable()
export class DashboardService extends BaseService {
  constructor(http: Http, router: Router) {
    super(http, router);

    Object.setPrototypeOf(this, DashboardService.prototype);
  }

  getDownloads(startRange: number, endRange: number) {
    console.log(startRange, endRange);
    return Observable.of([]).delay(600);
  }

  getCampusTile(search: URLSearchParams) {
    console.log(search);
    return Observable.of(mockCampuTile()).delay(400);
  }

  getAssessment(startRange: number, endRange: number) {
    console.log(startRange, endRange);
    return Observable.of([]).delay(560);
  }

  getIntegrations(startRange: number, endRange: number) {
    console.log(startRange, endRange);
    return Observable.of([]).delay(560);
  }

  getTopClubs(search: URLSearchParams) {
    console.log(search);
    return Observable.of(mockTopClubsTile()).delay(400);
  }

  getGeneralInformation(startRange: number, endRange: number) {
    console.log(startRange, endRange);
    return Observable.of([]).delay(2300);
  }

  getTopEvents(search: URLSearchParams) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.ASSESS_EVENT}/`;

    return super.get(url, { search }).map(res => res.json());
  }

  getTopServices(search: URLSearchParams) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.ASSESS_SERVICE}/`;

    return super.get(url, { search }).map(res => res.json());
  }
}

const mockCampuTile = () => {
  let res = [];
  let counter = 0;

  while (counter < 15) {
    res.push(
      {
        'id': counter + 1,
        'title': `Title ${counter}`,
        'avatar': '',
        'clicks': (Math.random() * (1000 - 32) + 32).toFixed(),
        'average': (Math.random() * (1000 - 32) + 32).toFixed()
      }
    )
    counter++;
  }
  return res;
}

const mockTopClubsTile = () => {
  let res = [];
  let counter = 0;

  while (counter < 5) {
    res.push(
      {
        'id': counter + 1,
        'title': `Title ${counter}`,
        'avatar': '',
        'members': (Math.random() * (1000 - 32) + 32).toFixed(),
      }
    )
    counter++;
  }
  return res;
}
