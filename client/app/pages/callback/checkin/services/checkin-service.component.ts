import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { URLSearchParams } from '@angular/http';

import { CheckinService } from '../checkin.service';
import { BaseComponent } from '../../../../base/base.component';

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
  isService = true;
  serviceId: string;
  state: IState = state;
  serviceProviderId: string;
  search: URLSearchParams = new URLSearchParams();


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private checkinService: CheckinService
  ) {
    super();
    super.isLoading().subscribe(res => this.loading = res);

    this.serviceId = this.route.snapshot.params['service'];
    this.serviceProviderId = this.route.snapshot.params['provider'];
  }

  onSubmit(data) {
    this
      .checkinService
      .doServiceCheckin(data, this.search)
      .subscribe(
        _ => this.updateAttendeesList(data),
        err => console.error(err)
      );
  }

  updateAttendeesList(data) {
    this.state.services = Object.assign(
      {},
      this.state.services,
      { external_attendees: [data, ...this.state.services['external_attendees'] ] }
    );
  }
  // cb/checkin/s/XeqmohCZNONC05rEcBItaw/rA5myiH9NEpMczvDufnVCw
  fetch() {
    super
      .fetchData(this.checkinService.getServiceData(this.search))
      .then(res => {
        console.log(res.data);
        this.state = Object.assign({}, this.state, { services: res.data });
      })
      .catch(err => console.log(err));
  }

  ngOnInit() {
    this.search.append('service_id', this.serviceId);
    this.search.append('provider_id', this.serviceProviderId);

    if (!this.serviceId || !this.serviceProviderId) {
      this.router.navigate(['/login']);
    }
    this.fetch();
  }
}