import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { CPSession } from '@campus-cloud/session';
import { BaseComponent } from '@campus-cloud/base';
import { ITile } from './../tile.interface';
import { TilesService } from '../tiles.service';
import { amplitudeEvents } from '@campus-cloud/shared/constants';
import { IPersona } from './../../persona.interface';
import { PersonasService } from '../../personas.service';
import { TilesUtilsService } from '../tiles.utils.service';
import { ContentUtilsProviders } from '@campus-cloud/libs/studio/providers';
import { ICampusGuide } from '../../sections/section.interface';
import { SectionsService } from '../../sections/sections.service';
import { baseActions, IHeader, ISnackbar } from '@campus-cloud/store/base';
import { CPTrackingService, CPI18nService } from '@campus-cloud/shared/services';
import { PersonasUtilsService } from './../../personas.utils.service';

@Component({
  selector: 'cp-personas-tile-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class PersonasTileEditComponent extends BaseComponent implements OnInit, OnDestroy {
  tileId;
  loading;
  editable;
  buttonData;
  campusLinkId;
  tile: ITile;
  persona: IPersona;
  personaId: number;
  filterByWeb = false;
  guide: ICampusGuide;
  filterByLogin = false;
  campusLinkForm: FormGroup;
  campusGuideTileForm: FormGroup;
  contentTypes = ContentUtilsProviders.contentTypes;
  selectedContent = ContentUtilsProviders.contentTypes.single;

  editedTileEventProperties = {
    status: null,
    tile_id: null,
    tile_type: amplitudeEvents.NORMAL,
    added_content: amplitudeEvents.NO,
    added_resource: amplitudeEvents.NO,
    uploaded_image: amplitudeEvents.NO
  };

  constructor(
    public router: Router,
    public fb: FormBuilder,
    public session: CPSession,
    public cpI18n: CPI18nService,
    public service: TilesService,
    public route: ActivatedRoute,
    public utils: TilesUtilsService,
    public cpTracking: CPTrackingService,
    public guideService: SectionsService,
    public personaService: PersonasService,
    public store: Store<IHeader | ISnackbar>
  ) {
    super();
    this.tileId = this.route.snapshot.params['tileId'];
    this.personaId = this.route.snapshot.params['personaId'];
    super.isLoading().subscribe((loading) => (this.loading = loading));
  }

  updateGuideTile(tileCategoryId = this.guide.id) {
    const cloneGuideTileForm = {
      ...this.campusGuideTileForm.value,
      tile_category_id: tileCategoryId
    };

    const updateLink$ = this.service.updateCampusLink(this.campusLinkId, this.campusLinkForm.value);

    return updateLink$.pipe(
      switchMap(({ id }: any) => {
        const extra_info = { id };

        const data = {
          ...cloneGuideTileForm,
          extra_info
        };

        return this.service.updateCampusTile(this.tileId, data);
      })
    );
  }

  onTypeChange(selectedContentId) {
    this.selectedContent = selectedContentId;
    this.campusLinkForm.patchValue({
      link_type: 3,
      link_url: null,
      link_params: {}
    });

    this.updateButtonDisableStatus();
  }

  erroHandler() {
    this.store.dispatch({
      type: baseActions.SNACKBAR_SHOW,
      payload: {
        sticky: true,
        class: 'danger',
        body: this.cpI18n.translate('something_went_wrong')
      }
    });
  }

  onSubmit() {
    const stream$ = this.updateGuideTile();

    stream$.subscribe(
      () => {
        this.buttonData = {
          ...this.buttonData,
          disabled: false
        };

        this.cpTracking.amplitudeEmitEvent(
          amplitudeEvents.STUDIO_UPDATED_TILE,
          this.editedTileEventProperties
        );

        this.router.navigate(['/studio/experiences', this.personaId]);
      },
      (_) => {
        this.buttonData = {
          ...this.buttonData,
          disabled: false
        };
        this.erroHandler();
      }
    );
  }

  doReset() {
    this.campusLinkForm.reset();
    this.campusGuideTileForm.reset();
  }

  buildForm() {
    const tileId = this.route.snapshot.params['tileId'];
    this.tile = this.guide.tiles.filter((i) => i.id === +tileId)[0];

    this.campusLinkForm = this.utils.campusLinkForm(false, false, this.tile.related_link_data);

    this.campusLinkId = this.tile.related_link_data.id;

    this.campusGuideTileForm = this.utils.campusGuideTileForm(
      this.personaId,
      this.guide,
      this.tile
    );

    this.setEditedTileEventProperties();

    this.editable = !this.utils.isCampaignTile(this.tile) && !this.utils.isDeprecated(this.tile);
    this.selectedContent = ContentUtilsProviders.getContentTypeByCampusLink(
      this.campusLinkForm.value
    );
  }

  buildHeader(personaName: string) {
    this.store.dispatch({
      type: baseActions.HEADER_UPDATE,
      payload: {
        heading: 't_personas_tile_update_header',
        subheading: null,
        em: null,
        crumbs: {
          url: `experiences/${this.personaId}`,
          label: `[NOTRANSLATE]${personaName}[NOTRANSLATE]`
        },
        children: []
      }
    });
  }

  updateButtonDisableStatus() {
    this.buttonData = {
      ...this.buttonData,
      disabled: !(this.campusGuideTileForm.valid && this.campusLinkForm.valid)
    };
  }

  onCampusGuideTileFormChange() {
    this.updateButtonDisableStatus();

    const name = this.campusGuideTileForm.controls['name'].value;
    const img_url = this.campusGuideTileForm.controls['img_url'].value;

    this.campusLinkForm.controls['name'].setValue(name);
    this.campusLinkForm.controls['img_url'].setValue(img_url);
  }

  onCampusLinkFormChange(newValues) {
    this.campusLinkForm.patchValue(newValues);
    this.updateButtonDisableStatus();
  }

  onChangedImage(isChanged: boolean) {
    const uploaded_image = isChanged ? amplitudeEvents.YES : amplitudeEvents.NO;

    this.editedTileEventProperties = {
      ...this.editedTileEventProperties,
      uploaded_image
    };
  }

  onChangedContent(contentType: number) {
    const added_content = contentType ? amplitudeEvents.YES : amplitudeEvents.NO;

    this.editedTileEventProperties = {
      ...this.editedTileEventProperties,
      added_content
    };
  }

  onChangedResource(resourceType: boolean) {
    const added_resource = resourceType ? amplitudeEvents.YES : amplitudeEvents.NO;

    this.editedTileEventProperties = {
      ...this.editedTileEventProperties,
      added_resource
    };
  }

  setEditedTileEventProperties() {
    const status = this.utils.isTileVisible(this.tile)
      ? amplitudeEvents.SHOWN
      : amplitudeEvents.HIDDEN;

    const tile_type = this.guide._featuredTile ? amplitudeEvents.FEATURED : amplitudeEvents.NORMAL;

    this.editedTileEventProperties = {
      ...this.editedTileEventProperties,
      status,
      tile_type,
      tile_id: this.tile.id
    };
  }

  ngOnDestroy() {
    this.guideService.guide = null;
    this.store.dispatch({ type: baseActions.SNACKBAR_HIDE });
  }

  fetch() {
    const search = new HttpParams().set('school_id', this.session.g.get('school').id);

    const persona$ = this.personaService.getPersonaById(this.personaId, search);

    super
      .fetchData(persona$)
      .then(({ data }) => {
        this.buildForm();
        this.persona = data;
        this.filterByWeb = PersonasUtilsService.isWeb(this.persona.platform);
        this.filterByLogin = PersonasUtilsService.isLoginForbidden(this.persona.login_requirement);
        this.buildHeader(PersonasUtilsService.localizedPersonaName(this.persona));
      })
      .catch(() => this.erroHandler());
  }

  ngOnInit(): void {
    this.guide = this.guideService.guide;

    if (!this.guide) {
      this.router.navigate(['/studio/experiences/', this.personaId]);

      return;
    }

    this.buttonData = {
      class: 'primary',
      disabled: false,
      text: this.cpI18n.translate('save')
    };

    this.fetch();
  }
}