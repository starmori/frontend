import { URLSearchParams, Headers } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import { ClubStatus } from '../club.status';
import { ClubsService } from '../clubs.service';
import { API } from '../../../../../config/api';
import { CPSession } from '../../../../../session';
import { BaseComponent } from '../../../../../base/base.component';
import { appStorage } from './../../../../../shared/utils/storage/storage';
import { CPI18nService, FileUploadService } from '../../../../../shared/services';
import { SNACKBAR_SHOW, ISnackbar } from './../../../../../reducers/snackbar.reducer';

@Component({
  selector: 'cp-clubs-info',
  templateUrl: './clubs-info.component.html',
  styleUrls: ['./clubs-info.component.scss']
})
export class ClubsInfoComponent extends BaseComponent implements OnInit {
  club;
  loading;
  clubStatus;
  clubId: number;
  draggable = false;
  hasMetaData = false;
  mapCenter: BehaviorSubject<any>;

  constructor(
    private session: CPSession,
    private route: ActivatedRoute,
    private cpI18n: CPI18nService,
    private store: Store<ISnackbar>,
    private clubsService: ClubsService,
    private fileService: FileUploadService
  ) {
    super();
    this.clubId = this.route.parent.snapshot.params['clubId'];

    super.isLoading().subscribe(res => this.loading = res);

    this.fetch();
  }

  private fetch() {
    let search = new URLSearchParams();
    search.append('school_id', this.session.g.get('school').id.toString());

    super
      .fetchData(this.clubsService.getClubById(this.clubId, search))
      .then(res => {
        this.club = res.data;
        this.mapCenter = new BehaviorSubject(
          {
            lat: res.data.latitude,
            lng: res.data.longitude
          }
        );
        this.hasMetaData = this.club.contactphone ||
          this.club.email ||
          this.club.room_info ||
          this.club.location ||
          this.club.website ||
          this.club.address ||
          this.club.constitution_url ||
          this.club.advisor_firstname ||
          this.club.advisor_lastname ||
          this.club.advisor_email;
      })
      .catch(err => { throw new Error(err) });
  }

  flashMessageSuccess() {
    this.store.dispatch({
      type: SNACKBAR_SHOW,
      payload: {
        autoClose: true,
        body: this.cpI18n.translate('message_file_upload_success')
      }
    });
  }

  flashMessageError() {
    this.store.dispatch({
      type: SNACKBAR_SHOW,
      payload: {
        class: 'danger',
        autoClose: true,
        body: this.cpI18n.translate('message_file_upload_error')
      }
    });
  }

  onFileAdded(file) {
    const headers = new Headers();
    const search = new URLSearchParams();
    search.append('school_id', this.session.g.get('school').id.toString());

    const auth = `${API.AUTH_HEADER.SESSION} ${appStorage.get(appStorage.keys.SESSION)}`;

    headers.append('Authorization', auth);
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.IMAGE}/`;

    this
      .fileService
      .uploadFile(file, url, headers)
      .switchMap(data => {

        this.club = Object.assign(
          {},
          this.club,
          { logo_url: data.image_url }
        )

        return this.clubsService.updateClub(this.club, this.clubId, search);
      })
      .subscribe(
        _ => this.flashMessageSuccess(),
        _ => this.flashMessageError()
      )
  }

  ngOnInit() {
    this.clubStatus = {
      [ClubStatus.inactive] : this.cpI18n.translate('inactive'),
      [ClubStatus.active] : this.cpI18n.translate('active'),
      [ClubStatus.pending] : this.cpI18n.translate('pending'),
    };
  }
}
