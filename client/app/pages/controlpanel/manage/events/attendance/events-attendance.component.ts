import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import {
  IHeader,
  HEADER_UPDATE
} from '../../../../../reducers/header.reducer';
import { EventsService } from '../events.service';
import { BaseComponent } from '../../../../../base/base.component';


@Component({
  selector: 'cp-events-attendance',
  templateUrl: './events-attendance.component.html',
  styleUrls: ['./events-attendance.component.scss']
})
export class EventsAttendanceComponent extends BaseComponent implements OnInit {
  event;
  loading = true;
  eventId: number;

  constructor(
    private store: Store<IHeader>,
    private route: ActivatedRoute,
    private service: EventsService
  ) {
    super();
    this.eventId = this.route.snapshot.params['eventId'];

    this.fetch();
  }

  private fetch() {
    super.isLoading().subscribe(res => this.loading = res);

    super
      .fetchData(this.service.getEventById(this.eventId))
      .then(res => {
        this.event = res;
        this.buildHeader(res);
        console.log(res);
      })
      .catch(err => console.error(err));
  }

  private buildHeader(res) {
    this.store.dispatch({
      type: HEADER_UPDATE,
      payload: {
        'heading': res.title,
        'subheading': '',
        'children': [
          {
            'label': 'Attendance',
            'url': `/manage/events/${this.eventId}`
          },
          {
            'label': 'Info',
            'url': `/manage/events/${this.eventId}/info`
          }
        ]
      }
    });
  }

  shouldBeFilled(rating: number, index: number) {
    return rating > index ? true : false;
  }

  buildStars(event) {
    const stars = [];
    const MAX_RATING = event.rating_scale_maximum;
    const AVG_RATING = event.avg_rating_percent;
    const rating = AVG_RATING / MAX_RATING;

    for (let i = 0; i < MAX_RATING; i++) {
      stars.push({
        'filled': this.shouldBeFilled(rating, i)
      });
    }
    return stars;
  }

  ngOnInit() { }
}
