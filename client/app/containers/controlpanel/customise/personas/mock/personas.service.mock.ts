import { Observable } from 'rxjs/Observable';

export const mockPersonas = [
  {
    login_requirement: 1,
    cre_enabled: false,
    rank: 1,
    platform: 0,
    localized_name_map: {
      fr: "Student's Tile",
      en: "Student's Tile"
    },
    pretour_enabled: false,
    id: 1
  },
  {
    login_requirement: -1,
    cre_enabled: false,
    rank: 2,
    platform: 1,
    localized_name_map: {
      fr: 'Web Persona Bonjour',
      en: 'Web Persona'
    },
    pretour_enabled: false,
    id: 89
  }
];

export class MockPersonasService {
  dummy;

  getPersonas() {
    return Observable.of(mockPersonas);
  }

  updatePersona(personaId, search, persona) {
    this.dummy = { personaId, search };

    return Observable.of(persona);
  }

  getPersonaById(personaId, search) {
    this.dummy = { personaId, search };

    return Observable.of(mockPersonas.filter((p) => p.id === personaId)[0]);
  }

  deletePersonaById(personaId, search) {
    this.dummy = { personaId, search };

    return Observable.of(personaId);
  }

  createPersona(body) {
    return Observable.of(body);
  }
}
