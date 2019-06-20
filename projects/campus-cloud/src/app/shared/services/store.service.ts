import { combineLatest, of as observableOf, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, startWith } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { API } from '@campus-cloud/config/api';
import { CPSession } from '@campus-cloud/session';
import { CPI18nService } from './i18n.service';
import { CP_PRIVILEGES_MAP } from '../constants';
import { HTTPService } from '@campus-cloud/base/http.service';
import { amplitudeEvents } from '../constants/analytics';
import { ClubStatus } from '@controlpanel/manage/clubs/club.status';
import { isClubAthletic } from '@controlpanel/manage/clubs/clubs.athletics.labels';
import { canAccountLevelReadResource, canSchoolReadResource } from '../utils/privileges';

const cpI18n = new CPI18nService();

export interface IStore {
  label: string;
  value: number | null;
  heading?: string;
  hostType?: string;
}

@Injectable()
export class StoreService extends HTTPService {
  constructor(http: HttpClient, router: Router, public session: CPSession) {
    super(http, router);

    Object.setPrototypeOf(this, StoreService.prototype);
  }

  private getServices(search: HttpParams) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.SERVICES}/1;1000`;

    return super.get(url, search).pipe(
      startWith([
        {
          label: cpI18n.translate('services'),
          value: null,
          heading: true
        }
      ]),
      map((res: any[]) => {
        const services = [
          {
            label: cpI18n.translate('services'),
            value: null,
            heading: true
          }
        ];

        const _services = res.map((store: any) => {
          return {
            label: store.name,
            value: store.store_id,
            heading: false,
            hostType: amplitudeEvents.SERVICE
          };
        });

        if (_services.length) {
          services.push(..._services);
        }

        return services.length === 1 ? [] : services;
      })
    );
  }

  private getAthletics(search: HttpParams) {
    const ACTIVE_CLUBS = ClubStatus.active.toString();
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.CLUBS}/1;1000`;

    search = search
      .append('category_id', isClubAthletic.athletic.toString())
      .append('status', ACTIVE_CLUBS);

    return super.get(url, search).pipe(
      startWith([
        {
          label: cpI18n.translate('athletics'),
          value: null,
          heading: true
        }
      ]),
      map((res: any[]) => {
        const athletics = [
          {
            label: cpI18n.translate('athletics'),
            value: null,
            heading: true
          }
        ];

        const _athletics = res.map((store: any) => {
          return {
            label: store.name,
            value: store.id,
            heading: false,
            hostType: amplitudeEvents.ATHLETICS
          };
        });

        if (_athletics.length) {
          athletics.push(..._athletics);
        }

        return athletics.length === 1 ? [] : athletics;
      })
    );
  }

  private getClubs(search: HttpParams) {
    const ACTIVE_CLUBS = ClubStatus.active.toString();
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.CLUBS}/1;1000`;

    search = search.append('status', ACTIVE_CLUBS);

    return super.get(url, search).pipe(
      startWith([
        {
          label: cpI18n.translate('clubs'),
          value: null,
          heading: true
        }
      ]),
      map((res: any[]) => {
        const clubs = [
          {
            label: cpI18n.translate('clubs'),
            value: null,
            heading: true
          }
        ];

        const _clubs = res.map((store: any) => {
          return {
            label: store.name,
            value: store.id,
            heading: false,
            hostType: amplitudeEvents.CLUB
          };
        });

        if (_clubs.length) {
          clubs.push(..._clubs);
        }

        return clubs.length === 1 ? [] : clubs;
      })
    );
  }

  getStores(
    search: HttpParams,
    placeHolder = cpI18n.translate('select_host')
  ): Observable<IStore[]> {
    /**
     * Check for user privileges before masking the call
     * to Stores/Clubs to avoid errors in Sentry
     */
    const clubsSchoolAccess = canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.clubs);
    const clubsAccountAccess = canAccountLevelReadResource(this.session.g, CP_PRIVILEGES_MAP.clubs);
    const canReadClubs = clubsSchoolAccess || clubsAccountAccess;

    const athleticsSchoolAccess = canSchoolReadResource(
      this.session.g,
      CP_PRIVILEGES_MAP.athletics
    );
    const athleticsAccountAccess = canAccountLevelReadResource(
      this.session.g,
      CP_PRIVILEGES_MAP.athletics
    );

    const canReadAthletics = athleticsSchoolAccess || athleticsAccountAccess;

    const servicesSchoolAccess = canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.services);
    const servicesAccountAccess = canAccountLevelReadResource(
      this.session.g,
      CP_PRIVILEGES_MAP.services
    );
    const canReadServices = servicesSchoolAccess || servicesAccountAccess;

    const clubs$ = canReadClubs ? this.getClubs(search) : observableOf([]);

    const athletics$ = canReadAthletics ? this.getAthletics(search) : observableOf([]);

    const services$ = canReadServices ? this.getServices(search) : observableOf([]);

    const stream$ = combineLatest([services$, clubs$, athletics$]);

    return stream$.pipe(
      map((res) => {
        if (!res[0].length && !res[1].length && !res[2].length) {
          return [
            {
              value: null,
              label: cpI18n.translate('select_host')
            }
          ];
        }

        return [
          {
            label: placeHolder,
            value: null,
            heading: false
          },
          ...res[0],
          ...res[1],
          ...res[2]
        ];
      })
    );
  }

  getStoreById(storeId: number) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.STORE}/${storeId}`;

    return super.get(url);
  }
}