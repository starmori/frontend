import { TemplatePortal } from '@angular/cdk/portal';
import {
  Overlay,
  OverlayRef,
  OverlayConfig,
  PositionStrategy,
  ConnectedPosition
} from '@angular/cdk/overlay';
import {
  Input,
  Directive,
  ElementRef,
  TemplateRef,
  HostListener,
  ViewContainerRef
} from '@angular/core';
import { coerceNumberProperty } from '@angular/cdk/coercion';

@Directive({
  exportAs: 'popover',
  selector: '[readyUiPopoverTrigger]'
})
export class PopoverTriggerDirective {
  yAxisOffset = 40;

  @Input()
  uiPopoverTpl: TemplateRef<any>;

  @Input()
  set uiPopoverYOffset(uiPopoverYOffset: string | number) {
    this.yAxisOffset = coerceNumberProperty(uiPopoverYOffset);
  }

  @Input()
  position: 'left' | 'right' = 'left';

  isOpen = false;
  overlayRef: OverlayRef;

  constructor(
    private el: ElementRef,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {}

  @HostListener('click')
  handleClick() {
    this.overlayRef ? this.close() : this.open();
  }

  open() {
    this.overlayRef = this.overlay.create(this.getConfig());
    const portal: TemplatePortal = new TemplatePortal(this.uiPopoverTpl, this.viewContainerRef);
    this.overlayRef.attach(portal);

    this.overlayRef.backdropClick().subscribe(() => this.close());
  }

  close() {
    if (!this.overlayRef) {
      return;
    }
    this.overlayRef.dispose();
    this.overlayRef = null;
  }

  private getConfig(): OverlayConfig {
    return {
      hasBackdrop: true,
      maxHeight: '500px',
      disposeOnNavigation: true,
      backdropClass: 'ui-popover',
      positionStrategy: this.getPositionStrategy(),
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    };
  }

  private getPositionStrategy(): PositionStrategy {
    return this.overlay
      .position()
      .flexibleConnectedTo(this.el)
      .withPositions(this.getPosition())
      .withDefaultOffsetY(this.yAxisOffset)
      .withPush(false);
  }

  private getPosition(): ConnectedPosition[] {
    return [
      {
        originX: this.position === 'left' ? 'start' : 'end',
        originY: 'top',
        overlayX: this.position === 'left' ? 'start' : 'end',
        overlayY: 'top'
      },
      {
        originX: this.position === 'left' ? 'start' : 'end',
        originY: 'bottom',
        overlayX: this.position === 'left' ? 'start' : 'end',
        overlayY: 'bottom'
      }
    ];
  }
}