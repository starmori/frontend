import { FormGroup, AbstractControl } from '@angular/forms';

import { emptyForm, filledForm } from '../tests';
import { IntegrationTypes } from '@libs/integrations/common/model';
import { AnnouncementPriority } from './../../announcements.interface';
import { AnnouncementIntegrationModel } from './announcement-integration.model';
import {
  validateMaxLength,
  validateOneOf,
  validatePositiveInteger,
  fillForm
} from '@shared/utils/tests';

describe('AnnouncementIntegrationModel', () => {
  describe('form', () => {
    let form: FormGroup;
    let ctrl: AbstractControl;

    beforeEach(() => {
      form = AnnouncementIntegrationModel.form();
    });

    it('should return announcements integration form', () => {
      expect(form.value).toEqual(emptyForm);
      expect(form instanceof FormGroup).toBe(true);
    });

    it('should set valid to true when filled with the correct values', () => {
      fillForm(form, filledForm);
      expect(form.valid).toBe(true);
    });

    it('should validate school_id', () => {
      ctrl = form.get('school_id');
      validatePositiveInteger(ctrl);
    });

    it('should validate feed_url', () => {
      ctrl = form.get('feed_url');

      ctrl.setValue('');
      expect(ctrl.valid).toBe(false);

      validateMaxLength(ctrl, 1024);
    });

    it('should validate feed_type', () => {
      ctrl = form.get('feed_type');
      validateOneOf(ctrl, [IntegrationTypes.rss, IntegrationTypes.atom]);
    });

    it('should validate store_id', () => {
      ctrl = form.get('store_id');
      validatePositiveInteger(ctrl);
    });

    it('should validate priority', () => {
      ctrl = form.get('priority');
      validateOneOf(ctrl, [AnnouncementPriority.regular, AnnouncementPriority.emergency]);
    });
  });
});