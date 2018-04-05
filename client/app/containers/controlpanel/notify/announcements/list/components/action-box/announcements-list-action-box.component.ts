import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { CPSession } from '../../../../../../../session';
import { CP_PRIVILEGES_MAP } from '../../../../../../../shared/constants';
import { CPI18nService } from './../../../../../../../shared/services/i18n.service';

interface IState {
  query: string;
  type: number;
}

const state: IState = {
  query: null,
  type: null
};

@Component({
  selector: 'cp-announcements-list-action-box',
  templateUrl: './announcements-list-action-box.component.html',
  styleUrls: ['./announcements-list-action-box.component.scss']
})
export class AnnouncementsListActionBoxComponent implements OnInit {
  @Output() filter: EventEmitter<IState> = new EventEmitter();
  @Output() launchModal: EventEmitter<null> = new EventEmitter();

  types;
  canCompose;
  state: IState = state;

  constructor(
    private session: CPSession,
    private cpI18n: CPI18nService
  ) { }

  onSearch(query) {
    this.state = Object.assign({}, this.state, { query });
    this.filter.emit(this.state);
  }

  onSelectedType(type) {
    this.state = Object.assign({}, this.state, { type: type.action });
    this.filter.emit(this.state);
  }

  ngOnInit() {
    const schoolPrivilege = this.session.g.get('user')
                            .school_level_privileges[this.session.g.get('school').id];

    this.canCompose = schoolPrivilege[CP_PRIVILEGES_MAP.campus_announcements].w;

    this.types = [
      {
        'label': this.cpI18n.translate('all'),
        'action': null
      },
      {
        'label': this.cpI18n.translate('regular'),
        'action': 2
      },
      {
        'label': this.cpI18n.translate('urgent'),
        'action': 1
      },
      {
        'label': this.cpI18n.translate('emergency'),
        'action': 0
      }
    ];
  }
}