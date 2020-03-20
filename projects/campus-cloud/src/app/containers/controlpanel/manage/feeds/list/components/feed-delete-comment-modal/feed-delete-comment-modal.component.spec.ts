import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';

import { mockFeed } from '@controlpanel/manage/feeds/tests';
import { FeedsService } from '@controlpanel/manage/feeds/feeds.service';
import { CPDeleteModalComponent } from '@campus-cloud/shared/components';
import { configureTestSuite, CPTestModule } from '@campus-cloud/shared/tests';
import { FeedsUtilsService } from '@controlpanel/manage/feeds/feeds.utils.service';
import { FeedsAmplitudeService } from '@controlpanel/manage/feeds/feeds.amplitude.service';
import { FeedDeleteCommentModalComponent } from '@controlpanel/manage/feeds/list/components';

describe('FeedDeleteCommentModalComponent', () => {
  configureTestSuite();

  beforeAll((done) =>
    (async () => {
      TestBed.configureTestingModule({
        imports: [CPTestModule],
        providers: [FeedsService, FeedsUtilsService, FeedsAmplitudeService],
        declarations: [FeedDeleteCommentModalComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });

      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail)
  );

  let cpDeleteModal: CPDeleteModalComponent;
  let component: FeedDeleteCommentModalComponent;
  let fixture: ComponentFixture<FeedDeleteCommentModalComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedDeleteCommentModalComponent);
    component = fixture.componentInstance;

    component.feed = mockFeed;
    component.isCampusWallView = new BehaviorSubject({ type: 1 });
    cpDeleteModal = fixture.debugElement.query(By.directive(CPDeleteModalComponent))
      .componentInstance;

    fixture.detectChanges();
  });

  it('should call onClose on cancelClick', () => {
    spyOn(component, 'onClose').and.callThrough();
    spyOn(component.teardown, 'emit');

    cpDeleteModal.cancelClick.emit();

    expect(component.onClose).toHaveBeenCalled();
    expect(component.teardown.emit).toHaveBeenCalled();
  });

  it('should call onDelete on cp-delete-modal deleteClick event', () => {
    spyOn(component, 'onDelete');

    cpDeleteModal.deleteClick.emit();

    expect(component.onDelete).toHaveBeenCalled();
  });
});
