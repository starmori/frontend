import { Component, OnInit, OnDestroy } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Store } from '@ngrx/store';

import { EventsService } from '../events.service';
import { BaseComponent } from '../../../../../base/base.component';
import { HEADER_UPDATE, IHeader } from '../../../../../reducers/header.reducer';

@Component({
  selector: 'cp-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent extends BaseComponent implements OnInit, OnDestroy {
  events;
  loading;
  isUpcoming;
  deleteEvent = '';

  constructor(
    private store: Store<IHeader>,
    private service: EventsService
  ) {
    super();
    this.buildHeader();
    super.isLoading().subscribe(res => this.loading = res);
  }

  private fetch(stream$) {
    super
      .fetchData(stream$)
      .then(res => {
        this.events = res;
      })
      .catch(err => console.error(err));
  }

  private buildHeader() {
    this.store.dispatch({
      type: HEADER_UPDATE,
      payload: require('../../manage.header.json')
    });
  }

  doFilter(state) {
    let search = new URLSearchParams();

    search.append('start', state.start);
    search.append('end', state.end);
    search.append('store_id', state.store_id);
    search.append('attendance_only', state.attendance_only);

    this.isUpcoming = state.upcoming;
    this.fetch(this.service.getEvents(search));
  }

  onDeleteEvent(event) {
    this.deleteEvent = event;
  }

  ngOnDestroy() {
    // console.log('destroy');

  }

  ngOnInit() { }
}
