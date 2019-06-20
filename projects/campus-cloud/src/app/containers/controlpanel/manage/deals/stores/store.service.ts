import { HttpParams, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { API } from '@campus-cloud/config/api';
import { HTTPService } from '@campus-cloud/base';

@Injectable()
export class DealsStoreService extends HTTPService {
  constructor(http: HttpClient, router: Router) {
    super(http, router);

    Object.setPrototypeOf(this, DealsStoreService.prototype);
  }

  getStores(startRage: number, endRage: number, search: HttpParams) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${
      API.ENDPOINTS.DEALS_STORE
    }/${startRage};${endRage}`;

    return super.get(url, search);
  }

  createStore(body: any, search: HttpParams) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.DEALS_STORE}/`;

    return super.post(url, body, search);
  }

  editStore(id: number, body: any, search: HttpParams) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.DEALS_STORE}/${id}`;

    return super.update(url, body, search);
  }

  deleteStore(id: number, search: HttpParams) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.DEALS_STORE}/${id}`;

    return super.delete(url, search);
  }
}