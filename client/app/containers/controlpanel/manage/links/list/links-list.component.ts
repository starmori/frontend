import { Component, OnInit } from '@angular/core';
import { URLSearchParams } from '@angular/http';

import { ILink } from '../link.interface';
import { LinksService } from '../links.service';
import { CPSession } from './../../../../../session/index';
import { BaseComponent } from '../../../../../base/base.component';
import { CPI18nService } from '../../../../../shared/services/index';

declare var $: any;

interface IState {
  links: Array<ILink>;
  search_str: string;
}

const state: IState = {
  links: [],
  search_str: null,
};

@Component({
  selector: 'cp-links-list',
  templateUrl: './links-list.component.html',
  styleUrls: ['./links-list.component.scss'],
})
export class LinksListComponent extends BaseComponent implements OnInit {
  pageNext;
  pagePrev;
  pageNumber;
  isLinksEdit;
  editLink = '';
  isLinksDelete;
  isLinksCreate;
  loading = true;
  deleteLink = '';
  state: IState = state;
  defaultImage = require('public/default/user.png');

  constructor(
    private session: CPSession,
    public cpI18n: CPI18nService,
    private service: LinksService,
  ) {
    super();

    this.fetch();

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

  private fetch() {
    const search = new URLSearchParams();
    search.append('search_str', this.state.search_str);
    search.append('school_id', this.session.g.get('school').id.toString());

    const end = this.endRange;
    const start = this.startRange;

    super
      .fetchData(this.service.getLinks(start, end, search))
      .then((res) => (this.state = { ...this.state, links: res.data }))
      .catch((err) => {
        throw new Error(err);
      });
  }

  onLaunchCreateModal() {
    this.isLinksCreate = true;

    setTimeout(
      () => {
        $('#linksCreate').modal();
      },

      1,
    );
  }

  onCreatedLink(link: ILink) {
    this.isLinksCreate = false;
    this.state.links = [link, ...this.state.links];
  }

  onEditedLink(editedLink) {
    this.isLinksEdit = false;

    this.state = Object.assign({}, this.state, {
      links: this.state.links.map(
        (link) => (link.id === editedLink.id ? editedLink : link),
      ),
    });
  }

  onDeletedLink(linkId: number) {
    this.isLinksDelete = false;

    this.state = Object.assign({}, this.state, {
      links: this.state.links.filter((link) => link.id !== linkId),
    });

    if (this.state.links.length === 0 && this.pageNumber > 1) {
      this.resetPagination();
      this.fetch();
    }
  }

  ngOnInit() {}
}
