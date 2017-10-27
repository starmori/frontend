import IEvent from './event.interface';

import { CPDate } from './../../../../shared/utils/date/date';

import { Injectable } from '@angular/core';
import { EventAttendance } from './event.status';

@Injectable()
export class EventUtilService {
  isPastEvent(event: IEvent): boolean {
    return event.end < CPDate.toEpoch(new Date());
  }

  isUpcomingEvent(event: IEvent) {
    return event.start > CPDate.toEpoch(new Date());
  };

  buildUrlPrefix(clubId: number = null, serviceId: number = null) {
    if (clubId) {
      return `/manage/clubs/${clubId}/events`;
    } else if (serviceId) {
      return `/manage/services/${serviceId}/events`;
    }
    return '/manage/events';
  }

  getSubNavChildren(event, urlPrefix) {
    let children = [];

    if (this.isPastEvent(event.end)) {
      if (event.event_attendance === EventAttendance.enabled) {
        children.push(
          {
            'label': 'Info',
            'url': `${urlPrefix}/${event.id}/info`
          },
          {
            'label': 'Assessment',
            'url': `${urlPrefix}/${event.id}`
          }
        );
      }
    }

    return children;
  }
}
