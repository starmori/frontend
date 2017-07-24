import {
  Input,
  OnInit,
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewEncapsulation
} from '@angular/core';

import * as moment from 'moment';
import { CPDate } from '../../../../../../shared/utils/date';

interface IProps {
  ends: number;
  starts: number;
  chart_data: Array<number>;
  no_engagement: Array<number>;
  one_engagement: Array<number>;
  repeat_engagement: Array<number>;
}

declare var Chartist;

@Component({
  selector: 'cp-engagement-chart',
  templateUrl: './engagement-chart.component.html',
  styleUrls: ['./engagement-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EngagementChartComponent implements OnInit, AfterViewInit {
  @Input() props: IProps;
  @ViewChild('chart') chart: ElementRef;

  data: Array<number>;

  isChartDataReady = false;

  constructor() { }

  buildLabels() {
    let labels = [];

    for (let i = 0; i <= this.props.chart_data.length; i++) {
      let date = CPDate
        .toEpoch(moment().subtract(this.props.chart_data.length - i, 'days')
          .hours(0).minutes(0).seconds(0));
      // console.log(moment.unix(date).format('MMM D'));
      labels.push(moment.unix(date).format('MMM D'));
    }

    return labels;
  }

  buildSeries() {
    let series = [];

    for (let i = 0; i <= this.props.chart_data.length; i++) {
      let date = CPDate
        .toEpoch(moment().subtract(this.props.chart_data.length - i, 'days')
          .hours(0).minutes(0).seconds(0));

      series.push(
        {
          'meta': moment.unix(date).format('ddd, MMM D'),
          'value': this.props.chart_data[i]
        }
      );
    }

    return series;
  }

  drawChart() {
    const data = {
      labels: this.buildLabels(),

      series: [this.buildSeries()],
    };

    const chipContent = `<span class="tooltip-chip"></span>
    <span class="tooltip-val">Engagement </span>`;

    const options = {
      plugins: [
        Chartist.plugins.tooltip(
          {
            currency: chipContent,

            appendToBody: true,

            anchorToPoint: true,

            pointClass: 'cp-point',
          }
        )
      ],

      lineSmooth: false,

      classNames: {
        grid: 'cp-grid',

        line: 'cp-line',

        point: 'cp-point',

        label: 'cp-label',
      },

      fullWidth: true,

      axisX: {
        position: 'end',

        showGrid: false,

        labelInterpolationFnc: function skipLabels(value, index, labels) {
          const DATE_TYPES = [30, 49, 90];
          const [MONTH, SIX_WEEKS, THREE_MONTHS] = DATE_TYPES;

          console.log(index);
          console.log(labels.length);

          if (labels.length === MONTH + 1) {
            return index % 3 === 0 ? value : null;
          }

          if (labels.length === SIX_WEEKS + 1) {
            return index % 5 === 0 ? value : null;
          }

          if (labels.length === THREE_MONTHS + 1) {
            return index % 7 === 0 ? value : null;
          }

          // if not too many skip last label
          if (labels.length === index + 1) {
            console.log('skipping last');
            return null;
          }

          return value;
        },
      }
    };

    const chart = new Chartist.Line(this.chart.nativeElement, data, options);

    chart.on('created', function() {
      this.isChartDataReady = true;
    }.bind(this));
  }

  ngAfterViewInit() {
    this.drawChart();
  }

  ngOnInit() {
    console.log('days ', this.props.chart_data.length);
  }
}

