import { mockSecurityTile, mockTile } from './tiles/__mock__/index';
import { PersonasType, PersonasLoginRequired } from './personas.status';
import { FormBuilder, FormGroup } from '@angular/forms';

import { mockPersonas } from './__mock__/personas.mock';
import mockSession from '../../../../session/mock/session';
import { PersonasUtilsService } from './personas.utils.service';
import { CPI18nService } from './../../../../shared/services/i18n.service';

describe('PersonasUtilsService', () => {
  let service: PersonasUtilsService;

  beforeEach(() => {
    const cpI18n = new CPI18nService();
    const fb = new FormBuilder();
    const cpSession = mockSession;

    service = new PersonasUtilsService(cpI18n, fb, cpSession);
  });

  it('should remove name key when parsing form data', () => {
    const name = 'delete me';
    const data = {
      ...mockPersonas[0],
      name
    };

    const result = service.parseLocalFormToApi(data);

    expect(result['name']).not.toBeDefined();
    expect(result.localized_name_map.en).toEqual(name);
    expect(result.localized_name_map.fr).toEqual(name);
  });

  it('should get localized persona name', () => {
    const persona = mockPersonas[0];
    const expected = persona.localized_name_map['en'];
    const result = service.localizedPersonaName(persona);

    expect(result).toEqual(expected);
  });

  it('should return persona type menu', () => {
    const result = service.plaftormMenu();
    const types = result.map((r) => r.id);

    expect(result.length).toBe(2);
    expect(types).toContain(PersonasType.web);
    expect(types).toContain(PersonasType.mobile);
  });

  it('should generate a tile form', () => {
    const result = service.getGuideTileForm();

    const expected = {
      color: 'FFFFFF',
      description: null,
      extra_info: {
        id: null
      },
      featured_rank: 0,
      img_url: null,
      school_id: 2806,
      school_persona_id: null,
      tile_category_id: 0,
      visibility_status: 1,
      name: null,
      rank: -1
    };

    expect(result instanceof FormGroup).toBe(true);
    expect(result.value).toEqual(expected);
  });

  it('should generate a link form', () => {
    const result = service.getCampusLinkForm();

    const expected = {
      description: null,
      img_url: null,
      is_system: 1,
      link_params: {
        id: null
      },
      link_url: 'oohlala://campus_security_service',
      name: null,
      open_in_browser: 0,
      school_id: 2806
    };

    expect(result instanceof FormGroup).toBe(true);
    expect(result.value).toEqual(expected);
  });

  it('should return campus security id if found else null', () => {
    const valid = service.getCampusSecurityServiceId(mockSecurityTile);
    const invalid = service.getCampusSecurityServiceId({});
    const expected = mockSecurityTile.related_link_data.link_params.id;

    expect(invalid).toBeNull();
    expect(valid).toEqual(expected);
  });

  it('should return filter tiles sort by rank', () => {
    const nonFeaturedTile = { ...mockTile };
    const featuredTileOne = {
      ...nonFeaturedTile,
      featured_rank: 2,
      name: 'featuredTileOne'
    };
    const featuredTileTwo = {
      ...nonFeaturedTile,
      featured_rank: 3,
      name: 'featuredTileTwo'
    };

    const tiles = [nonFeaturedTile, featuredTileOne, featuredTileTwo];
    const result = service.getFeaturedTiles(tiles);

    expect(result.length).toBe(2);
    expect(result[0].name).toBe('featuredTileOne');
  });

  it('should return category zero tiles', () => {
    const catZeroTileNonFeaturedOne = {
      ...mockTile,
      rank: 1,
      featured_rank: -1,
      tile_category_id: 0,
      name: 'catZeroTileNonFeaturedOne'
    };

    const catZeroTileNonFeaturedTwo = {
      ...mockTile,
      rank: 2,
      featured_rank: -1,
      tile_category_id: 0,
      name: 'catZeroTileNonFeaturedTwo'
    };

    const catZeroTileFeatured = {
      ...mockTile,
      tile_category_id: 0,
      featured_rank: 1
    };

    const nonCatZero = {
      ...mockTile,
      tile_category_id: 1,
      featured_rank: -1
    };

    const tiles = [
      catZeroTileNonFeaturedOne,
      catZeroTileNonFeaturedTwo,
      catZeroTileFeatured,
      nonCatZero
    ];

    const result = service.getCategoryZeroTiles(tiles);

    expect(result.length).toBe(2);
    expect(result[0].name).toBe('catZeroTileNonFeaturedOne');
  });

  it('requiresCredentialsMenu', () => {
    const result = service.requiresCredentialsMenu();
    const personaLogins = result.map((p) => p.id);
    const personaLoginOptions = [
      PersonasLoginRequired.optional,
      PersonasLoginRequired.required,
      PersonasLoginRequired.forbidden
    ];

    expect(result.length).toBe(3);
    personaLoginOptions.forEach((t) => {
      expect(personaLogins).toContain(t);
    });
  });
});
