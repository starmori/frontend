import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HEADER_UPDATE, IHeader } from './../../../../../reducers/header.reducer';
import { ISnackbar } from './../../../../../reducers/snackbar.reducer';
import { IPersona } from './../persona.interface';
import { PersonasService } from './../personas.service';
import { PersonasUtilsService } from './../personas.utils.service';
import { ICampusGuide } from './../sections/section.interface';
import { SectionUtilsService } from './../sections/section.utils.service';
import { SectionsService } from './../sections/sections.service';
import { ITile } from './../tiles/tile.interface';
import { BaseComponent } from '../../../../../base';
import { CPSession } from '../../../../../session';
import { CPI18nService } from '../../../../../shared/services';

interface IState {
  working: boolean;
  featureTiles: Array<ITile>;
  categoryZero: Array<ITile>;
  guides: Array<ICampusGuide>;
}

@Component({
  selector: 'cp-personas-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class PersonasDetailsComponent extends BaseComponent implements OnInit {
  loading;
  personaId;

  state: IState = {
    working: false,
    guides: [],
    featureTiles: [],
    categoryZero: []
  };

  constructor(
    public router: Router,
    public session: CPSession,
    public route: ActivatedRoute,
    public cpI18n: CPI18nService,
    public service: PersonasService,
    public utils: PersonasUtilsService,
    public sectionService: SectionsService,
    public sectionUtils: SectionUtilsService,
    public store: Store<IHeader | ISnackbar>
  ) {
    super();
    super.isLoading().subscribe((loading) => (this.loading = loading));
    this.personaId = this.route.snapshot.params['personaId'];
  }

  onAddSectionBefore(newGuide: ICampusGuide, guideId: number) {
    const nextGuide = (guide: ICampusGuide) => guide.id === guideId;
    const nextGuideIndex = this.state.guides.findIndex(nextGuide);

    this.state.guides.splice(nextGuideIndex, 0, newGuide);
  }

  onRemoveSection(guideId) {
    this.state = {
      ...this.state,
      guides: this.state.guides.filter((guide) => guide.id !== guideId)
    };
  }

  onDeletedSection(sectionId: number) {
    this.state.guides = this.state.guides.filter((guide: ICampusGuide) => guide.id !== sectionId);
  }

  previousRank(index): number {
    return index === 0 ? this.state.guides[index].rank - 1 : this.state.guides[index - 1].rank;
  }

  errorHanlder() {}

  moveUp(guide) {
    const previousSectionIndex = this.state.guides.findIndex((g) => g.id === guide.id);
    const previousSection = this.state.guides[previousSectionIndex - 1];

    const school_id = this.session.g.get('school').id;
    const [newRank, currentRank] = [previousSection.rank, guide.rank];

    const currentTileBody = {
      school_id,
      rank: newRank
    };
    const pushedTileBody = {
      school_id,
      rank: currentRank
    };

    const updateCurrentTile$ = this.service.updateSectionTileCategory(guide.id, currentTileBody);
    const updatePushedTile$ = this.service.updateSectionTileCategory(
      previousSection.id,
      pushedTileBody
    );

    const stream$ = updateCurrentTile$.pipe(switchMap(() => updatePushedTile$));

    stream$.subscribe(
      () => {
        this.state = { ...this.state, working: false };
        this.fetch();
      },
      () => this.errorHanlder()
    );
  }

  moveDown(guide) {
    const nextSectionIndex = this.state.guides.findIndex((g) => g.id === guide.id);
    const nextSection = this.state.guides[nextSectionIndex + 1];

    const school_id = this.session.g.get('school').id;
    const [newRank, currentRank] = [nextSection.rank, guide.rank];
    const currentTileBody = {
      school_id,
      rank: newRank
    };
    const pushedTileBody = {
      school_id,
      rank: currentRank
    };

    const updateCurrentTile$ = this.service.updateSectionTileCategory(guide.id, currentTileBody);
    const updatePushedTile$ = this.service.updateSectionTileCategory(
      nextSection.id,
      pushedTileBody
    );

    const stream$ = updateCurrentTile$.pipe(switchMap(() => updatePushedTile$));

    stream$.subscribe(
      () => {
        this.state = { ...this.state, working: false };
        this.fetch();
      },
      () => this.errorHanlder()
    );
  }

  onSwapSection(direction: string, guide: ICampusGuide) {
    this.state = {
      ...this.state,
      working: true
    };
    if (direction === 'up') {
      this.moveUp(guide);
    } else {
      this.moveDown(guide);
    }
  }

  createFeatureTile() {
    let tempGuide = this.sectionUtils.temporaryGuide();
    tempGuide = {
      ...tempGuide,
      featureTile: true
    };
    this.sectionService.guide = tempGuide;

    this.router.navigate([`/customize/personas/${this.personaId}/tiles`]);
  }

  createCategoryZeroTile() {
    let tempGuide = this.sectionUtils.temporaryGuide();
    tempGuide = {
      ...tempGuide,
      categoryZero: true
    };
    this.sectionService.guide = tempGuide;

    this.router.navigate([`/customize/personas/${this.personaId}/tiles`]);
  }

  fetch() {
    const schoolIdSearch = new HttpParams().append('school_id', this.session.g.get('school').id);

    const tilesSearch = schoolIdSearch.append('school_persona_id', this.personaId);

    const tilesByPersona$ = this.service.getTilesByPersona(tilesSearch);
    const tileCategories$ = this.service.getTilesCategories(schoolIdSearch);
    const tilesByPersonaZero$ = this.service.getTilesByPersona(schoolIdSearch);
    const persona$ = this.service.getPersonaById(this.personaId, schoolIdSearch);

    const request$ = persona$.pipe(
      switchMap((persona: IPersona) => {
        const key = CPI18nService.getLocale().startsWith('fr') ? 'fr' : 'en';

        this.updateHeader(persona.localized_name_map[key]);

        return combineLatest([tilesByPersona$, tileCategories$, tilesByPersonaZero$]);
      })
    );

    const stream$ = request$.pipe(
      map(([tiles, categories, tilesByPersonaZero]) => {
        tiles = this.utils.mergeRelatedLinkData(tiles, tilesByPersonaZero);

        return {
          featured: this.utils.getFeatureTiles(tiles),
          categoryZero: this.utils.getCategoryZeroTiles(tiles),
          guides: this.utils.groupTilesWithTileCategories(categories, tiles)
        };
      })
    );

    super
      .fetchData(stream$)
      .then(({ data }) => {
        const filteredTiles = data.guides.filter((g: ICampusGuide) => g.tiles.length);

        const temporaryTile = [this.sectionUtils.temporaryGuide()];

        const guides = filteredTiles.length ? filteredTiles : temporaryTile;

        this.state = {
          ...this.state,
          guides,
          featureTiles: data.featured,
          categoryZero: data.categoryZero
        };
      })
      .catch(() => this.router.navigate(['/customize/personas']));
  }

  updateHeader(personName) {
    this.store.dispatch({
      type: HEADER_UPDATE,
      payload: {
        heading: `[NOTRANSLATE]${personName}[NOTRANSLATE]`,
        subheading: null,
        em: null,
        crumbs: {
          url: 'personas',
          label: 't_personas'
        },
        children: []
      }
    });
  }

  ngOnInit(): void {
    this.fetch();
  }
}
