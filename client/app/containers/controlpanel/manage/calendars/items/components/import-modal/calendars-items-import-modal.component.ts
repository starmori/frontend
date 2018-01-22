import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { isDev } from '../../../../../../../config/env';
import { CalendarsService } from '../../../calendars.services';
import { FileUploadService } from '../../../../../../../shared/services';
import { CPI18nService } from './../../../../../../../shared/services/i18n.service';

@Component({
  selector: 'cp-calendars-items-import-modal',
  templateUrl: './calendars-items-import-modal.component.html',
  styleUrls: ['./calendars-items-import-modal.component.scss'],
})
export class CalendarsItemsImportModalComponent implements OnInit {
  options;
  fileName;
  calendarId: number;

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private cpI18n: CPI18nService,
    private service: CalendarsService,
    private fileService: FileUploadService,
  ) {
    this.calendarId = this.route.snapshot.params['calendarId'];
  }

  parser(file) {
    const url = !isDev
      ? '/calendars/items/import'
      : 'http://localhost:8000/calendars/items/import';

    return this.fileService
      .uploadFile(file, url)
      .toPromise()
      .then((res) => {
        this.service.setItems(res);

        return Promise.resolve();
      })
      .catch((err) => {
        const serverError = err.json().error;

        return Promise.reject(
          serverError
            ? serverError
            : this.cpI18n.translate('something_went_wrong'),
        );
      });
  }

  onSuccess() {
    this.router.navigate([`/manage/calendars/${this.calendarId}/items/import`]);
  }

  ngOnInit() {
    this.fileName = 'mass_calendar_item_invite_sample.csv';

    const templateUrl = isDev
      ? `/templates/${this.fileName}`
      : `/dist/templates/${this.fileName}`;

    this.options = {
      templateUrl,
      validExtensions: ['csv'],
      parser: this.parser.bind(this),
    };
  }
}
