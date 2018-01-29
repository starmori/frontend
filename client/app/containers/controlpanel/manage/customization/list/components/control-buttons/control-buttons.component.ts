import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

import { CPI18nService } from '../../../../../../../shared/services';

@Component({
  selector: 'cp-customizaton-control-buttons',
  templateUrl: './control-buttons.component.html',
  styleUrls: ['./control-buttons.component.scss'],
})
export class CustomizationControlButtonsComponent implements OnInit {
  @Output() save: EventEmitter<null> = new EventEmitter();
  @Output() cancel: EventEmitter<null> = new EventEmitter();

  buttonData;

  @Input()
  set loading(loading) {
    this.buttonData = { ...this.buttonData, disabled: loading };
  }

  constructor(public cpI18n: CPI18nService) {}

  ngOnInit() {
    this.buttonData = {
      class: 'primary',
      text: this.cpI18n.translate('save'),
    };
  }
}
