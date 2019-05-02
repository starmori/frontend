import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { tap, take, switchMap, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromStore from '../store';
import { CPSession } from '@app/session';

@Injectable()
export class LocationExistsGuard implements CanActivate {
  constructor(private session: CPSession, private store: Store<fromStore.ILocationsState>) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.getFromStoreOrApi(+route.params.locationId).pipe(
      switchMap(() => of(true)),
      catchError(() => of(false))
    );
  }

  getFromStoreOrApi(locationId: number): Observable<boolean> {
    return this.store.select(fromStore.getLocationsById(locationId)).pipe(
      tap((location: any) => {
        if (!location || !location.schedule.length) {
          const search = new HttpParams().append('school_id', this.session.g.get('school').id);
          const payload = {
            locationId,
            params: search
          };
          this.store.dispatch(new fromStore.GetLocationById(payload));
        }
      }),
      take(1)
    );
  }
}
