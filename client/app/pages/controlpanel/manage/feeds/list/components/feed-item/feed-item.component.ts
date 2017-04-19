import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { CPDate } from '../../../../../../../shared/utils';
import { FORMAT } from '../../../../../../../shared/pipes/date.pipe';

declare var $: any;

@Component({
  selector: 'cp-feed-item',
  templateUrl: './feed-item.component.html',
  styleUrls: ['./feed-item.component.scss']
})
export class FeedItemComponent implements OnInit {
  @Input() feed: any;
  @Output() deleted: EventEmitter<number> = new EventEmitter();

  isMoveModal;
  isDeleteModal;
  isApproveModal;
  CPDate = CPDate;
  FORMAT = FORMAT.SHORT;

  constructor() { }

  onSelected(action) {
    switch (action) {
      case 1:
        this.isApproveModal = true;
        setTimeout(() => { $('#approveFeedModal').modal(); }, 1);
        break;
      case 2:
        this.isMoveModal = true;
        setTimeout(() => { $('#moveFeedModal').modal(); }, 1);
        break;
      case 3:
        this.isDeleteModal = true;
        setTimeout(() => { $('#deleteFeedModal').modal(); }, 1);
        break;
    }
  }

  ngOnInit() {
    // console.log(this);
  }
}
