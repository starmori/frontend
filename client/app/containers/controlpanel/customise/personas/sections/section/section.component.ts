import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { SNACKBAR_SHOW } from './../../../../../../reducers/snackbar.reducer';
import { ICampusGuide, ITile } from './../../persona.interface';
import { SectionsService } from './../sections.service';
import { ISnackbar } from '../../../../../../reducers/snackbar.reducer';
import { CPSession } from '../../../../../../session';
import { CPI18nService } from '../../../../../../shared/services';

@Component({
  selector: 'cp-personas-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class PersonasSectionComponent implements OnInit {
  @Input() guide: ICampusGuide;

  @Output() addTileClick: EventEmitter<null> = new EventEmitter();
  @Output() deletedSection: EventEmitter<number> = new EventEmitter();
  // @Output() deleteTile: EventEmitter<number> = new EventEmitter();
  // @Output() editTileClick: EventEmitter<number> = new EventEmitter();
  // @Output() toggleTileVisibility: EventEmitter<number> = new EventEmitter();

  constructor(
    public session: CPSession,
    public service: SectionsService,
    public store: Store<ISnackbar>,
    public cpI18n: CPI18nService
  ) {}

  onEditedTile(editedTile: ITile) {
    this.guide = {
      ...this.guide,
      tiles: this.guide.tiles.map((tile: ITile) => (tile.id === editedTile.id ? editedTile : tile))
    };
  }

  errorHandler() {
    this.store.dispatch({
      type: SNACKBAR_SHOW,
      payload: {
        body: this.cpI18n.translate('something_went_wrong'),
        class: 'danger',
        sticky: true,
        autoClose: true
      }
    });
  }

  onNameChange({ name }) {
    const body = {
      name,
      school_id: this.session.g.get('school').id
    };

    this.service.updateSectionTileCategory(this.guide.id, body).subscribe(
      (guide: ICampusGuide) => {
        this.guide = {
          ...this.guide,
          name: guide.name
        };
      },
      () => this.errorHandler()
    );
  }

  onDeleteSection() {
    const search = new HttpParams().set('school_id', this.session.g.get('school').id);

    this.service
      .deleteSectionTileCategory(this.guide.id, search)
      .subscribe(() => this.deletedSection.emit(this.guide.id), () => this.errorHandler());
  }

  onDeletedTile(tileId: number) {
    this.guide = {
      ...this.guide,
      tiles: this.guide.tiles.filter((tile: ITile) => tile.id !== tileId)
    };
  }

  ngOnInit(): void {}
}
