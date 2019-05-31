import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { map, startWith } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CPDate } from '@shared/utils';
import { CPI18nPipe } from '@shared/pipes';
import { baseActions } from '@app/store/base';
import { getEventsModalState } from '@app/store';
import { EventsService } from '../events.service';
import { CPSession, ISchool } from '@app/session';
import { EventUtilService } from '../events.utils.service';
import { amplitudeEvents, STATUS } from '@shared/constants';
import { CPImageUploadComponent } from '@shared/components';
import { EventsComponent } from '../list/base/events.component';
import { SnackbarError } from '@app/store/base/reducers/snackbar.reducer';
import {
  AdminService,
  StoreService,
  ModalService,
  CPI18nService,
  FileUploadService,
  CPTrackingService
} from '@shared/services';

import {
  isAllDay,
  CheckInMethod,
  EventFeedback,
  attendanceType,
  EventAttendance
} from '../event.status';

const i18n = new CPI18nPipe();

@Component({
  selector: 'cp-events-excel',
  templateUrl: './events-excel.component.html',
  styleUrls: ['./events-excel.component.scss']
})
export class EventsExcelComponent extends EventsComponent implements OnInit {
  @Input() storeId: number;
  @Input() clubId: number;
  @Input() isClub: boolean;
  @Input() serviceId: number;
  @Input() isService: boolean;
  @Input() isChecked: boolean;
  @Input() athleticId: number;
  @Input() isAthletic: boolean;
  @Input() orientationId: number;
  @Input() isOrientation: boolean;

  error;
  events;
  stores;
  urlPrefix;
  formError;
  buttonData;
  checkInOptions = [];
  school: ISchool;
  loading = false;
  form: FormGroup;
  uploadButtonData;
  selectedHost = [];
  eventManager = [];
  isFormReady = false;
  isSingleChecked = [];
  attendanceFeedback = [];
  eventAttendanceFeedback;
  selectedCheckInOption = [];
  resetManagerDropdown$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<any>,
    public session: CPSession,
    public cpI18n: CPI18nService,
    public service: EventsService,
    private utils: EventUtilService,
    public modalService: ModalService,
    private adminService: AdminService,
    private storeService: StoreService,
    private cpTracking: CPTrackingService,
    private fileUploadService: FileUploadService
  ) {
    super(session, cpI18n, service, modalService);
    this.school = this.session.g.get('school');
    super.isLoading().subscribe((res) => (this.loading = res));
  }

  public fetch() {
    const search: HttpParams = new HttpParams().append('school_id', this.school.id.toString());

    const stores$ = this.storeService.getStores(search);

    super.fetchData(stores$).then((res) => {
      this.buildForm();
      this.buildHeader();
      this.stores = res.data;
    });
  }

  private buildHeader() {
    const subheading = i18n.transform('events_import_csv_sub_heading', this.events.length);
    this.store.dispatch({
      type: baseActions.HEADER_UPDATE,
      payload: {
        heading: 'events_import_csv_heading',
        crumbs: {
          url: this.urlPrefix,
          label: 'events'
        },
        em: `[NOTRANSLATE]${subheading}[NOTRANSLATE]`,
        children: []
      }
    });
  }

  private buildForm() {
    this.form = this.fb.group({
      events: this.fb.array([])
    });
    this.buildGroup();

    if (this.isService) {
      this.updateManagersByStoreOrClubId(this.storeId);
    }
    if (this.isClub) {
      this.updateManagersByStoreOrClubId(this.clubId);
    }
    if (this.isOrientation) {
      this.updateManagersByStoreOrClubId(null);
    }

    this.form.valueChanges.subscribe((_) => {
      this.buttonData = Object.assign({}, this.buttonData, {
        disabled: !this.form.valid
      });
    });
  }

  private buildGroup() {
    const control = <FormArray>this.form.controls['events'];

    this.events.forEach((event, index) => {
      control.push(this.buildEventControl(event));
      this.isSingleChecked.push({ index, checked: false });
    });

    this.isFormReady = true;
  }

  removeControl(index) {
    const control = <FormArray>this.form.controls['events'];
    control.removeAt(index);
  }

  buildEventControl(event) {
    let store_id;

    if (this.storeId) {
      store_id = this.storeId;
    }

    if (this.clubId) {
      store_id = this.clubId;
    }

    return this.fb.group({
      room: [event.room],
      event_manager_id: [null],
      location: [event.location],
      is_all_day: [isAllDay.enabled],
      description: [event.description],
      attendance_manager_email: [null],
      poster_url: [null, Validators.required],
      event_feedback: [EventFeedback.enabled],
      title: [event.title, Validators.required],
      has_checkout: [attendanceType.checkInOnly],
      event_attendance: [EventAttendance.disabled],
      managers: [[{ label: '---', event: null }]],
      poster_thumb_url: [null, Validators.required],
      end: [CPDate.toEpoch(event.end_date, this.session.tz), Validators.required],
      start: [CPDate.toEpoch(event.start_date, this.session.tz), Validators.required],
      store_id: [store_id ? store_id : null, !this.isOrientation ? Validators.required : null],
      attend_verification_methods: [[CheckInMethod.web, CheckInMethod.webQr, CheckInMethod.app]]
    });
  }

  updateEventManager(manager, index) {
    const controls = <FormArray>this.form.controls['events'];
    const control = <FormGroup>controls.controls[index];

    control.controls['event_manager_id'].setValue(manager.value);
  }

  updateAttendanceFeedback(feedback, index) {
    const controls = <FormArray>this.form.controls['events'];
    const control = <FormGroup>controls.controls[index];

    control.controls['event_feedback'].setValue(feedback.event);
  }

  onBulkChange(actions) {
    const control = <FormArray>this.form.controls['events'];
    if ('store_id' in actions && !this.isOrientation) {
      // load all managers for all controls
      if (actions.store_id) {
        this.updateManagersByStoreOrClubId(actions.store_id.value);
      }
    }

    this.isSingleChecked.map((item) => {
      if (item.checked) {
        const ctrl = <FormGroup>control.controls[item.index];
        Object.keys(actions).forEach((key) => {
          if (key === 'store_id' && actions[key] !== null) {
            this.selectedHost[item.index] = actions[key];
            ctrl.controls[key].setValue(actions[key].value);
          } else if (key === 'event_manager_id') {
            this.eventManager[item.index] = actions[key];
            if (actions[key] !== null) {
              ctrl.controls[key].setValue(actions[key].value);
            } else {
              ctrl.controls[key].setValue(actions[key]);
            }
          } else if (key === 'event_feedback') {
            this.attendanceFeedback[item.index] = actions[key];
            ctrl.controls[key].setValue(actions[key].event);
          } else if (key === 'has_checkout') {
            this.selectedCheckInOption[item.index] = actions[key];
            ctrl.controls[key].setValue(actions[key].action);
          } else if (actions[key] !== null) {
            ctrl.controls[key].setValue(actions[key]);
          }
        });
      }

      return item;
    });
  }

  onSingleHostSelected(host, index) {
    const controls = <FormArray>this.form.controls['events'];
    const control = <FormGroup>controls.controls[index];
    const managers$ = this.getManagersByHostId(host.value);

    managers$.subscribe((res) => {
      control.controls['managers'].setValue(res);
    });

    this.resetManagerDropdown$.next(true);
    control.controls['event_manager_id'].setValue(null);
    control.controls['store_id'].setValue(host.value);
  }

  updateManagersByStoreOrClubId(storeOrClubId) {
    const events = <FormArray>this.form.controls['events'];
    const managers$ = this.getManagersByHostId(storeOrClubId);
    const groups = events.controls;

    managers$.pipe(startWith([{ label: '---' }])).subscribe(
      (managers) => {
        groups.forEach((group: FormGroup) => {
          group.controls['managers'].setValue(managers);
        });
      },
      () => {
        this.store.dispatch(
          new SnackbarError({ body: this.cpI18n.translate('something_went_wrong') })
        );
      }
    );
  }

  getManagersByHostId(storeOrClubId): Observable<any> {
    if (!storeOrClubId && !this.isOrientation) {
      return of([{ label: '---' }]);
    }
    const search: HttpParams = new HttpParams()
      .append('school_id', this.school.id.toString())
      .append('store_id', storeOrClubId)
      .append('privilege_type', this.utils.getPrivilegeType(this.isOrientation));

    return this.adminService.getAdminByStoreId(search).pipe(
      map((admins) => {
        const _admins = [
          {
            label: '---',
            value: null
          }
        ];
        admins.forEach((admin: any) => {
          _admins.push({
            label: `${admin.firstname} ${admin.lastname}`,
            value: admin.id
          });
        });

        return _admins;
      })
    );
  }

  onSingleCheck(checked, index) {
    const isChecked = this.isSingleChecked.map((item) => {
      if (item.index === index) {
        item = Object.assign({}, item, { checked: checked });
      }

      return item;
    });

    const getOnlyChecked = isChecked.filter((item) => item.checked);

    const isParentChecked = isChecked.length === getOnlyChecked.length;
    const getChecked = getOnlyChecked.length > 0;
    this.updateUploadPictureButtonStatus(getChecked);
    this.updateParentCheckedStatus(isParentChecked);
    this.isSingleChecked = [...isChecked];
  }

  onCheckAll(checked) {
    if (this.events.length < 1) {
      return;
    }
    const isChecked = [];

    this.isSingleChecked.map((item) => {
      isChecked.push(Object.assign({}, item, { checked: checked }));
    });
    this.updateUploadPictureButtonStatus(checked);
    this.isSingleChecked = [...isChecked];
  }

  resetAllCheckboxes(checked, index) {
    this.onCheckAll(false);
    this.onSingleCheck(checked, index);
  }

  updateParentCheckedStatus(checked) {
    this.isChecked = checked;
  }

  updateUploadPictureButtonStatus(checked) {
    const className = checked ? 'cancel' : 'disabled';

    this.uploadButtonData = {
      class: className
    };
    this.isChecked = checked;
  }

  onHostBulkChange(store_id) {
    this.onBulkChange({ store_id });
  }

  onImageBulkChange(poster_url) {
    this.onBulkChange({ poster_url });
    this.onBulkChange({ poster_thumb_url: poster_url });
  }

  onRemoveImage(index: number) {
    const eventControl = <FormArray>this.form.controls['events'];
    const control = <FormGroup>eventControl.at(index);
    control.controls['poster_url'].setValue(null);
  }

  onImageUpload(image: string, index: number) {
    const imageUpload = new CPImageUploadComponent(this.cpI18n, this.fileUploadService);
    const promise = imageUpload.onFileUpload(image, true);

    promise
      .then((res: any) => {
        const controls = <FormArray>this.form.controls['events'];
        const control = <FormGroup>controls.controls[index];
        control.controls['poster_url'].setValue(res.image_url);
        control.controls['poster_thumb_url'].setValue(res.image_url);
      })
      .catch((err) => {
        this.store.dispatch({
          type: baseActions.SNACKBAR_SHOW,
          payload: {
            class: 'danger',
            autoClose: true,
            sticky: true,
            body: err ? err : this.cpI18n.translate('something_went_wrong')
          }
        });
      });
  }

  onSubmit() {
    this.error = null;
    const _events = [];
    this.formError = false;
    let requiredFieldsError = false;
    const events = Object.assign({}, this.form.controls['events'].value);

    const eventsData = <FormArray>this.form.controls['events'];
    const eventGroups = eventsData.controls;

    Object.keys(eventGroups).forEach((index) => {
      const controls = eventGroups[index].controls;
      if (controls.event_attendance.value === EventAttendance.enabled) {
        if (!controls.event_manager_id.value) {
          requiredFieldsError = true;
          controls.event_manager_id.setErrors({ required: true });
        }
        if (!controls.event_attendance.value) {
          requiredFieldsError = true;
          controls.event_attendance.setErrors({ required: true });
        }
      }
    });

    if (requiredFieldsError || !this.form.valid) {
      this.formError = true;
      this.error = STATUS.ALL_FIELDS_ARE_REQUIRED;
      this.buttonData = Object.assign({}, this.buttonData, { disabled: false });

      return;
    }

    Object.keys(events).forEach((key) => {
      _events.push(this.buildEvent(events[key]));
    });

    let search = new HttpParams();
    if (this.orientationId) {
      search = search
        .append('school_id', this.session.g.get('school').id)
        .append('calendar_id', this.orientationId.toString());
    }

    this.service.createEvent(_events, search).subscribe(
      () => {
        this.cpTracking.amplitudeEmitEvent(amplitudeEvents.MANAGE_IMPORTED_EVENT);
        this.router.navigate([this.urlPrefix]);

        return;
      },
      (err) => {
        this.formError = true;
        this.buttonData = Object.assign({}, this.buttonData, {
          disabled: false
        });

        if (err.status === 400) {
          this.error = STATUS.ALL_FIELDS_ARE_REQUIRED;

          return;
        }

        this.error = STATUS.SOMETHING_WENT_WRONG;
      }
    );
  }

  buildEvent(event) {
    let store_id;

    if (this.storeId) {
      store_id = this.storeId;
    }

    if (this.clubId) {
      store_id = this.clubId;
    }
    let _event = {
      title: event.title,
      is_all_day: isAllDay.disabled,
      store_id: store_id ? store_id : event.store_id,
      description: event.description,
      end: event.end,
      room: event.room,
      start: event.start,
      location: event.location,
      poster_url: event.poster_url,
      has_checkout: event.has_checkout,
      poster_thumb_url: event.poster_thumb_url,
      event_attendance: event.event_attendance
    };

    if (event.event_attendance === EventAttendance.enabled) {
      _event = Object.assign({}, _event, {
        event_feedback: event.event_feedback,
        event_manager_id: event.event_manager_id
      });
      if (event.attendance_manager_email) {
        _event = Object.assign({}, _event, {
          attendance_manager_email: event.attendance_manager_email
        });
      }
    }

    return _event;
  }

  updateCheckInOption(item, index) {
    const controls = <FormArray>this.form.controls['events'];
    const control = <FormGroup>controls.controls[index];

    control.controls['has_checkout'].setValue(item);
    control.controls['event_manager_id'].setValue(null);
    control.controls['event_attendance'].setValue(
      item !== null ? EventAttendance.enabled : EventAttendance.disabled
    );
  }

  ngOnInit() {
    this.urlPrefix = this.utils.buildUrlPrefix(this.getEventType());

    this.isChecked = false;
    this.uploadButtonData = {
      class: 'disabled',
      disabled: true
    };

    this.buttonData = {
      text: this.cpI18n.translate('t_events_import_import_events'),
      class: 'primary',
      disabled: true
    };

    const attendanceTypeOptions = [
      {
        action: null,
        label: this.cpI18n.translate('t_events_assessment_no_check_in')
      }
    ];

    this.eventAttendanceFeedback = this.utils.getAttendanceFeedback();

    this.checkInOptions = [...attendanceTypeOptions, ...this.utils.getAttendanceTypeOptions()];

    this.store.select(getEventsModalState).subscribe((res) => {
      this.events = res;

      if (!this.storeId && !this.clubId && !this.isOrientation) {
        this.fetch();

        return;
      }

      this.buildForm();
      this.buildHeader();
    });
  }
}
