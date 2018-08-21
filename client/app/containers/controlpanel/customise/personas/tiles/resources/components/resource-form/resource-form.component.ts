import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ResourcesUtilsService } from './../../resources.utils.service';
import { CPI18nService } from '../../../../../../../../shared/services/i18n.service';

@Component({
  selector: 'cp-personas-resource-form',
  templateUrl: './resource-form.component.html',
  styleUrls: ['./resource-form.component.scss']
})
export class PersonasResourceFormComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() editView = false;
  @Input() hideTypeSelector = false;

  @Output() formChange: EventEmitter<FormGroup> = new EventEmitter();

  contentTypes;
  selectedItem = null;

  state = {
    resource: false,
    resourceList: false
  };

  constructor(public cpI18n: CPI18nService, public utils: ResourcesUtilsService) {}

  updateFormMetaValues(data) {
    for (const key in data.meta) {
      this.form.controls[key].setValue(data.meta[key]);
    }
  }

  nonEmptyObject(control) {
    if (control.value) {
      return Object.keys(control.value).length > 0 ? null : { valid: false };
    }

    return null;
  }

  onContentTypeChange(selected) {
    this.form.controls['link_url'].setValue(null);
    this.form.controls['link_params'].setValue({});

    this.state = {
      ...this.state,
      resource: selected.extra_field_type === 2,
      resourceList: selected.extra_field_type === 3
    };
  }

  onLinkUrlChange(url) {
    this.form.controls['link_url'].setValue(url);
  }

  requiresLinkParams(linkUrl) {
    const requiresLinkParams = [
      'oohlala://store',
      'oohlala://store_list',
      'oohlala://campus_service',
      'oohlala://subscribable_calendar',
      'oohlala://service_by_category_id'
    ];

    return requiresLinkParams.includes(linkUrl);
  }

  onResourceTypeSelected(resourceType) {
    this.form.controls['link_url'].setValue(null);
    this.form.controls['link_params'].setValue({});

    if (this.requiresLinkParams(resourceType.meta.link_url)) {
      this.form.get('link_params').setValidators([Validators.required, this.nonEmptyObject]);
    } else {
      this.form.get('link_params').setValidators([Validators.required]);
    }

    this.updateFormMetaValues(resourceType);
  }

  updateState() {
    this.state = {
      ...this.state,
      resource: !this.utils.isListOfLists(this.form.value),
      resourceList: this.utils.isListOfLists(this.form.value)
    };

    const selectedType = this.state.resource ? 'resource' : 'resource_list';

    this.selectedItem = this.contentTypes.filter((i) => i.id === selectedType)[0];
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => {
      this.formChange.emit(this.form);
    });

    if (this.hideTypeSelector) {
      this.state = {
        ...this.state,
        resource: true,
        resourceList: false
      };
    }

    this.contentTypes = require('./content-types.json').map((content) => {
      return {
        ...content,
        label: this.cpI18n.translate(content.label)
      };
    });

    if (this.editView) {
      this.updateState();
    }
  }
}
