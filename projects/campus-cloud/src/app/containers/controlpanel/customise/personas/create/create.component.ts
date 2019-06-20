import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { get as _get } from 'lodash';
import { Observable } from 'rxjs';

import { CPSession } from '../../../../../session';
import { PersonasService } from './../personas.service';
import { PersonasUtilsService } from './../personas.utils.service';
import { baseActions, IHeader } from './../../../../../store/base';
import { amplitudeEvents } from '../../../../../shared/constants/analytics';
import { CPI18nService, CPTrackingService } from '../../../../../shared/services';
import { credentialType, PersonasType, PersonaValidationErrors } from './../personas.status';
import { PersonasFormComponent } from './../components/personas-form/personas-form.component';

@Component({
  selector: 'cp-personas-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class PersonasCreateComponent implements OnInit {
  @ViewChild('createForm', { static: true }) createForm: PersonasFormComponent;

  services$;
  buttonData;
  form: FormGroup;
  createdPersonaId;
  campusSecurityTile;

  constructor(
    public router: Router,
    public fb: FormBuilder,
    public session: CPSession,
    public cpI18n: CPI18nService,
    public store: Store<IHeader>,
    public service: PersonasService,
    public utils: PersonasUtilsService,
    public cpTracking: CPTrackingService
  ) {}

  buildHeader() {
    const payload = {
      heading: 't_personas_create_header_title',
      subheading: null,
      em: null,
      children: []
    };

    this.store.dispatch({
      type: baseActions.HEADER_UPDATE,
      payload
    });
  }

  onSecurityServiceChanged(selection) {
    const serviceMeta = _get(selection, 'meta', null);

    this.campusSecurityTile = serviceMeta;
  }

  getCampusLinkForm() {
    const service = this.campusSecurityTile;

    const campusLinkForm = this.utils.getCampusLinkForm();

    campusLinkForm.controls['name'].setValue(service.name);
    campusLinkForm.controls['img_url'].setValue(service.img_url);

    const link_params = <FormGroup>campusLinkForm.controls['link_params'];
    link_params.controls['id'].setValue(service.id);

    return campusLinkForm.value;
  }

  createCampusTile(campusLinkId, personaId): Observable<any> {
    const service = this.campusSecurityTile;

    const guideTileForm = this.utils.getGuideTileForm();

    guideTileForm.controls['name'].setValue(service.name);

    const extra_info = <FormGroup>guideTileForm.controls['extra_info'];
    extra_info.controls['id'].setValue(campusLinkId);

    const data = {
      ...guideTileForm.value,
      school_persona_id: personaId
    };

    return this.service.createGuideTile(data);
  }

  createSecurityTile(personaId): Observable<any> {
    const campusLinkForm = this.getCampusLinkForm();
    const createCampusLink$ = this.service.createCampusLink(campusLinkForm);

    return createCampusLink$.pipe(
      switchMap((link: any) => this.createCampusTile(link.id, personaId))
    );
  }

  onSubmit() {
    const formData = this.createForm.form.value;
    const body = this.utils.parseLocalFormToApi(formData);
    const createPersona$ = this.service.createPersona(body);

    const stream$ = this.campusSecurityTile
      ? createPersona$.pipe(
          map(({ id }: any) => {
            this.createdPersonaId = id;

            return id;
          }),
          switchMap((id) => this.createSecurityTile(id))
        )
      : createPersona$.pipe(map(({ id }: any) => (this.createdPersonaId = id)));

    stream$.subscribe(
      () => {
        this.trackCreateExperienceEvent(formData, this.createdPersonaId, this.campusSecurityTile);
        this.router.navigate([`/studio/experiences/${this.createdPersonaId}`]);
      },
      (err) => {
        this.buttonData = { ...this.buttonData, disabled: false };

        const error = JSON.parse(err._body).error;
        let message = this.cpI18n.translate('something_went_wrong');

        if (error === PersonaValidationErrors.api_env) {
          message = this.cpI18n.translate('t_personas_create_error_api_env');
        } else if (error === PersonaValidationErrors.customization_off) {
          message = this.cpI18n.translate('t_personas_create_error_customization off');
        }

        this.store.dispatch({
          type: baseActions.SNACKBAR_SHOW,
          payload: {
            sticky: true,
            class: 'danger',
            body: message
          }
        });
      }
    );
  }

  onFormValueChanges(form: FormGroup) {
    this.buttonData = { ...this.buttonData, disabled: !form.valid };
  }

  buildForm() {
    this.form = this.utils.getPersonasForm();
  }

  loadServices() {
    const search = new HttpParams().set('school_id', this.session.g.get('school').id);

    this.services$ = this.service.getServices(search);
  }

  trackCreateExperienceEvent(data, experience_id, isSecurityService) {
    const experience_type =
      data.platform === PersonasType.web ? amplitudeEvents.WEB : amplitudeEvents.MOBILE;

    const campus_security = isSecurityService ? amplitudeEvents.YES : amplitudeEvents.NO;

    const eventProperties = {
      experience_id,
      experience_type,
      campus_security,
      credential_type: credentialType[data.login_requirement]
    };

    this.cpTracking.amplitudeEmitEvent(amplitudeEvents.STUDIO_CREATED_EXPERIENCE, eventProperties);
  }

  ngOnInit(): void {
    this.buildForm();
    this.buildHeader();
    this.loadServices();

    this.buttonData = {
      class: 'primary',
      disabled: true,
      text: this.cpI18n.translate('save')
    };
  }
}