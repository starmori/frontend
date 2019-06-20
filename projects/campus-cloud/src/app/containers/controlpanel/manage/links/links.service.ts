import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { API } from '../../../../config/api';
import { HTTPService } from '../../../../base/http.service';

export enum ChangedURL {
  'yes' = 'Yes',
  'no' = 'No'
}

export const didUrlChange = (oldURL, newURL) =>
  oldURL === newURL ? ChangedURL.no : ChangedURL.yes;

@Injectable()
export class LinksService extends HTTPService {
  constructor(http: HttpClient, router: Router) {
    super(http, router);

    Object.setPrototypeOf(this, LinksService.prototype);
  }

  getUploadImageUrl() {
    return `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.IMAGE}/`;
  }

  getLinks(startRage: number, endRage: number, search?: HttpParams) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.LINKS}/${startRage};${endRage}`;

    return super.get(url, search);
  }

  getLinkById(linkId: number) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.LINKS}/${linkId}`;

    return super.get(url);
  }

  updateLink(body, linkId: number) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.LINKS}/${linkId}`;

    return super.update(url, body);
  }

  createLink(body) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.LINKS}/`;

    return super.post(url, body);
  }

  deleteLink(linkId: number) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.LINKS}/${linkId}`;

    return super.delete(url);
  }
}