import { Component, OnInit } from '@angular/core';
import { merge, Observable, of, Subject } from 'rxjs';
import { FormsService, FormStatus } from '@controlpanel/contact-trace/forms';
import { CPSession } from '@campus-cloud/session';
import { ContactTraceHeaderService } from '@controlpanel/contact-trace/utils';
import { Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  share,
  startWith,
  switchMap
} from 'rxjs/operators';
import { StoreCategory } from '@campus-cloud/shared/services';
import { HttpParams } from '@angular/common/http';
import { ExposureNotification, ExposureNotificationService } from '../.';

@Component({
  selector: 'cp-exposure-notification-list',
  templateUrl: './exposure-notification-list.component.html',
  styleUrls: ['./exposure-notification-list.component.scss']
})
export class ExposureNotificationListComponent implements OnInit {
  webServiceCallInProgress: boolean;

  searchTerm: string;
  searchTermStream = new Subject<string>();
  pageStream = new Subject<number>();
  filterStream = new Subject<FormStatus>();
  hasMorePages = false;

  filter: FormStatus;
  pageCounter = 1;
  paginationCountPerPage = 25;
  results: ExposureNotification[] = [];

  constructor(
    private session: CPSession,
    private headerService: ContactTraceHeaderService,
    private formsService: FormsService,
    private notificationService: ExposureNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.headerService.updateHeader();

    this.formsService.setFormBeingEdited(null);

    const searchSource = this.searchTermStream.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      map((searchTerm) => {
        this.searchTerm = searchTerm;
        this.pageCounter = 1;
        return { searchTerm: searchTerm, page: this.pageCounter };
      })
    );

    const pageSource = this.pageStream.pipe(
      map((pageNumber) => {
        this.pageCounter = pageNumber;
        return { searchTerm: this.searchTerm, page: pageNumber };
      })
    );

    const filterSource = this.filterStream.pipe(
      map((filter) => {
        this.filter = filter;
        this.pageCounter = 1;
        return { searchTerm: this.searchTerm, page: this.pageCounter };
      })
    );

    const combinedSource: Observable<any[]> = merge(pageSource, searchSource, filterSource).pipe(
      startWith({ searchTerm: this.searchTerm, page: this.pageCounter }),
      switchMap((args: { searchTerm: string; page: number }) => {
        return this.fetch(args.page, this.paginationCountPerPage);
      }),
      share()
    );

    combinedSource.subscribe((data) => this.handleDataLoad(data));
  }

  fetch(pageNumber: number, paginationCountPerPage: number): Observable<ExposureNotification[]> {
    let startRecordCount = paginationCountPerPage * (pageNumber - 1) + 1;
    // Get an extra record so that we know if there are more records left to fetch
    let endRecordCount = paginationCountPerPage * pageNumber + 1;
    const hostCategories = [StoreCategory.services, StoreCategory.clubs, StoreCategory.athletics];
    const params = new HttpParams()
      .set('search_str', this.searchTerm === '' ? null : this.searchTerm)
      .set('school_id', this.session.school.id.toString())
      .set('status', this.filter === null || this.filter === undefined ? null : '' + this.filter)
      .set('is_template', 'false');
    this.webServiceCallInProgress = true;
    return this.notificationService
      .searchNotifications(startRecordCount, endRecordCount, params)
      .pipe(
        map((notifications: ExposureNotification[]) => {
          if (notifications && notifications.length > this.paginationCountPerPage) {
            this.hasMorePages = true;
            // Remove the extra record that we fetched to check if we have more records to fetch.
            notifications = notifications.splice(0, this.paginationCountPerPage);
          } else {
            this.hasMorePages = false;
          }
          return notifications;
        }),
        finalize(() => (this.webServiceCallInProgress = false)),
        catchError(() => {
          this.hasMorePages = false;
          return of([]);
        })
      );
  }

  private handleDataLoad(data: ExposureNotification[]) {
    console.log('data', data);
    this.results = data;
  }

  onPaginationNext() {
    this.pageCounter++;
    this.pageStream.next(this.pageCounter);
  }

  onPaginationPrevious() {
    this.pageCounter--;
    this.pageStream.next(this.pageCounter);
  }

  onLaunchCreateModal(): void {
    this.router.navigate(['/contact-trace/forms/edit', 0, 'info']);
  }

  onSearch(search_str) {
    this.searchTermStream.next(search_str);
  }

  itemUpdateHandler(): void {
    // Refresh items on current page
    this.pageStream.next(this.pageCounter);
  }

  filterChangeHandler({ action }: { label?: string; action?: FormStatus }): void {
    this.filterStream.next(action);
  }
}
