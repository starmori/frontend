import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { CPSession } from '../../../../session';
import { CheckinService } from '../checkin.service';
import { CheckinUtilsService } from '../checkin.utils.service';
import { BaseComponent } from '../../../../base/base.component';
import { CheckInOutTime, CheckInType } from '../../callback.status';
import { amplitudeEvents } from '../../../../shared/constants/analytics';
import { ISnackbar, SNACKBAR_SHOW } from '../../../../reducers/snackbar.reducer';
import { CPI18nService, CPTrackingService, ErrorService } from '../../../../shared/services';

interface IState {
  services: Array<any>;
}

const state: IState = {
  services: []
};

@Component({
  selector: 'cp-checkin-service',
  templateUrl: './checkin-service.component.html',
  styleUrls: ['./checkin-service.component.scss']
})
export class CheckinServiceComponent extends BaseComponent implements OnInit {
  loading;
  isExist = true;
  isService = true;
  serviceId: string;
  state: IState = state;
  serviceProviderId: string;
  search: HttpParams;

  constructor(
    public router: Router,
    public session: CPSession,
    public route: ActivatedRoute,
    public cpI18n: CPI18nService,
    public store: Store<ISnackbar>,
    public utils: CheckinUtilsService,
    public errorService: ErrorService,
    public cpTracking: CPTrackingService,
    public checkinService: CheckinService
  ) {
    super();
    super.isLoading().subscribe((res) => (this.loading = res));

    this.serviceId = this.route.snapshot.params['service'];
    this.serviceProviderId = this.route.snapshot.params['provider'];
  }

  onSubmit(data) {
    this.checkinService.doServiceCheckin(data, this.search).subscribe(
      (res) => {
        this.updateAttendeesList(data, res);
        this.trackAmplitudeEvent(true);
      },
      (_) => {
        this.errorService.handleError(this.cpI18n.translate('something_went_wrong'));
      }
    );
  }

  updateAttendeesList(data, res) {
    if (!res.attendance_id) {
      this.handleError();

      return;
    }

    data = {
      ...data,
      attendance_id: res.attendance_id,
      check_in_type: CheckInType.web,
      check_out_time_epoch: CheckInOutTime.empty
    };

    this.state.services = Object.assign({}, this.state.services, {
      attendees: [data, ...this.state.services['attendees']]
    });
  }

  handleError(status = null) {
    const body = status
      ? this.utils.getErrorMessage(status)
      : this.cpI18n.translate('t_external_checkin_already_checked_in');

    this.store.dispatch({
      type: SNACKBAR_SHOW,
      payload: {
        body,
        sticky: true,
        autoClose: true,
        class: 'danger'
      }
    });
  }

  fetch() {
    super
      .fetchData(this.checkinService.getServiceData(this.search, true))
      .then((res) => {
        this.state = Object.assign({}, this.state, { services: res.data });
      })
      .catch((_) => this.router.navigate(['/login']));
  }

  trackAmplitudeEvent(checkedin = false) {
    const eventName = checkedin
      ? amplitudeEvents.MANAGE_CHECKEDIN_MANUALLY
      : amplitudeEvents.MANAGE_LOADED_CHECKIN;

    const eventProperties = {
      service_id: this.serviceId,
      check_in_type: amplitudeEvents.SERVICE
    };

    this.cpTracking.amplitudeEmitEvent(eventName, eventProperties);
  }

  ngOnInit() {
    if (!this.session.g.get('user')) {
      this.cpTracking.loadAmplitude();
    }

    this.trackAmplitudeEvent();
    this.search = new HttpParams()
      .set('service_id', this.serviceId)
      .set('provider_id', this.serviceProviderId);

    if (!this.serviceId || !this.serviceProviderId) {
      this.router.navigate(['/login']);
    }
    this.fetch();
  }
}
