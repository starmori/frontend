import {
  NgZone,
  OnInit,
  Output,
  Component,
  ViewChild,
  ElementRef,
  EventEmitter,
  AfterViewInit
} from '@angular/core';

declare var google: any;

@Component({
  selector: 'cp-place-autocomplete',
  templateUrl: './cp-place-autocomplete.component.html',
  styleUrls: ['./cp-place-autocomplete.component.scss']
})
export class CPPlaceAutoCompleteComponent implements OnInit, AfterViewInit {
  @Output() placeChange: EventEmitter<any> = new EventEmitter();
  @ViewChild('input') input: ElementRef;

  constructor(
    private zone: NgZone
  ) { }

  ngAfterViewInit() {
    const input = this.input.nativeElement;
    const autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener('place_changed', () => {
      this.zone.run(() => {
        this.placeChange.emit(autocomplete.getPlace());
      });
    });
  }

  ngOnInit() { }
}
