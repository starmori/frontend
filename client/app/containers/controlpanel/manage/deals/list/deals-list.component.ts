import { Component, OnInit } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Store } from '@ngrx/store';

import { IDeal } from '../deals.interface';
import { DealsService } from '../deals.service';
import { ManageHeaderService } from '../../utils';
import { CPSession } from '../../../../../session';
import { BaseComponent } from '../../../../../base';
import { CPI18nService } from '../../../../../shared/services';
import { HEADER_UPDATE, IHeader } from '../../../../../reducers/header.reducer';

export interface IState {
  deals: Array<IDeal>;
  store_id: number;
  search_str: string;
  sort_field: string;
  sort_direction: string;
}

const state = {
  deals: [],
  store_id: null,
  search_str: null,
  sort_field: 'title',
  sort_direction: 'asc'
};

@Component({
  selector: 'cp-deals-list',
  templateUrl: './deals-list.component.html',
  styleUrls: ['./deals-list.component.scss']
})
export class DealsListComponent extends BaseComponent implements OnInit {
  loading;
  deleteDeal;
  state: IState = state;
  launchDeleteModal = false;

  constructor(
    public session: CPSession,
    public cpI18n: CPI18nService,
    public store: Store<IHeader>,
    public service: DealsService,
    public headerService: ManageHeaderService
  ) {
    super();
    super.isLoading().subscribe((loading) => (this.loading = loading));
  }

  onPaginationNext() {
    super.goToNext();

    this.fetch();
  }

  onPaginationPrevious() {
    super.goToPrevious();

    this.fetch();
  }

  onSearch(search_str) {
    this.state = Object.assign({}, this.state, { search_str });

    this.resetPagination();

    this.fetch();
  }

  doSort(sort_field) {
    this.state = {
      ...this.state,
      sort_field: sort_field,
      sort_direction: this.state.sort_direction === 'asc' ? 'desc' : 'asc'
    };

    this.fetch();
  }

  onDeleted(id: number) {
    this.deleteDeal = null;
    this.state = Object.assign({}, this.state, {
      deals: this.state.deals.filter((deal) => deal.id !== id)
    });

    if (this.state.deals.length === 0 && this.pageNumber > 1) {
      this.resetPagination();
      this.fetch();
    }
  }

  doFilter(filter) {
    this.state = Object.assign({}, this.state, {
      store_id: filter.store_id
    });

    this.fetch();
  }

  public fetch() {
    const search = new URLSearchParams();
    const store_id = this.state.store_id ? this.state.store_id.toString() : null;

    search.append('store_id', store_id);
    search.append('search_str', this.state.search_str);
    search.append('sort_field', this.state.sort_field);
    search.append('sort_direction', this.state.sort_direction);
    search.append('school_id', this.session.g.get('school').id.toString());

    super
      .fetchData(this.service.getDeals(this.startRange, this.endRange, search))
      .then((res) => (this.state = { ...this.state, deals: res.data }));
  }

  buildHeader() {
    this.store.dispatch({
      type: HEADER_UPDATE,
      payload: this.headerService.filterByPrivileges()
    });
  }

  ngOnInit() {
    this.fetch();
    this.buildHeader();
  }
}
