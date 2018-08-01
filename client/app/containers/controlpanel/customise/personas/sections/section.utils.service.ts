import { CPI18nService } from './../../../../../shared/services/i18n.service';
import { ICampusGuide } from './section.interface';
import { Injectable } from '@angular/core';
import { ITile } from '../tiles/tile.interface';

@Injectable()
export class SectionUtilsService {
  constructor(public cpI18n: CPI18nService) {}

  isTemporaryGuide(guide: ICampusGuide) {
    return !guide.tiles.length;
  }

  tileAtIndex(tiles: ITile[], index) {
    return tiles[index];
  }

  temporaryGuide(rank = 1): ICampusGuide {
    return {
      rank,
      id: null,
      tiles: [],
      name: this.cpI18n.translate('t_personas_create_section_default_name')
    };
  }
}
