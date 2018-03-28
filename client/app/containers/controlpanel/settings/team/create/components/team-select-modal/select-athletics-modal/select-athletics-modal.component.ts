import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { CPSession } from '../../../../../../../../session';
import { ClubsService } from '../../../../../../manage/clubs/clubs.service';
import { CP_PRIVILEGES_MAP } from '../../../../../../../../shared/constants';
import { BaseTeamSelectModalComponent } from '../base/team-select-modal.component';
import { clubAthleticStatus, isClubAthletic } from '../../../../team.utils.service';

@Component({
  selector: 'cp-select-athletics-modal',
  templateUrl: './select-athletics-modal.component.html'
})
export class SelectTeamAthleticsModalComponent extends BaseTeamSelectModalComponent
  implements OnInit {
  @Input() selectedAthletics: any;
  @Input() reset: Observable<boolean>;

  @Output() cancel: EventEmitter<any> = new EventEmitter();
  @Output() selected: EventEmitter<any> = new EventEmitter();
  @Output() teardown: EventEmitter<null> = new EventEmitter();

  data$: BehaviorSubject<any> = new BehaviorSubject({});

  constructor(public session: CPSession, private service: ClubsService) {
    super(session);
    this.privilegeType = CP_PRIVILEGES_MAP.athletics;
  }

  doReset() {
    this.teardown.emit();
  }

  ngOnInit() {
    const search = new URLSearchParams();
    search.append('school_id', this.session.g.get('school').id.toString());
    search.append('category_id', isClubAthletic.athletic.toString());

    this.service
      .getClubs(search, 1, 1000)
      .map((athletics) =>
        athletics.filter((athletic) => athletic.status === clubAthleticStatus.active)
      )
      .subscribe((athletics) => {
        let res = {};
        const selected = {};

        if (this.selectedAthletics) {
          athletics.map((athletic) => {
            if (Object.keys(this.selectedAthletics).includes(athletic.id.toString())) {
              if (CP_PRIVILEGES_MAP.athletics in this.selectedAthletics[athletic.id]) {
                selected[athletic.id] = athletic;
              }
            }

            if (selected[athletic.id]) {
              athletic.checked = true;
              // we pass the id to the selected object
              // to populate the modal state....
              selected[athletic.id] = Object.assign({}, selected[athletic.id], {
                id: athletic.id
              });
            }
          });
        }
        res = {
          data: athletics,
          selected: selected
        };

        this.data$.next(res);
      });
  }
}
