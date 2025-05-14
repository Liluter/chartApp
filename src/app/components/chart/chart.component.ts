import { AfterViewInit, Component, inject, Signal, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SliceData } from '../../shared/types/data';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-chart',
  imports: [BaseChartDirective],
  templateUrl: './chart.component.html',
})
export class ChartComponent implements AfterViewInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective<'bar'> | undefined;
  private _orderService = inject(OrdersService)
  readonly dataSlice: Signal<SliceData | null> = this._orderService.sliceData
  readonly currentFrame = this._orderService.current
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    aspectRatio: 16 / 6,
    indexAxis: 'y',
    animation: {
      duration: 500,
      delay: 50
    },
    plugins: {
      title: {
        display: false,
        text: 'Order book',
      },
    },
  };
  public barChartType = 'bar' as const;
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Bid',
      backgroundColor: '#cc3300',
      data: [],
    }, {
      label: 'Ask',
      data: [],
      backgroundColor: '#7093DB',
    }],
  };

  ngAfterViewInit(): void {
    const data = this.dataSlice()
    if (data) {
      this.barChartOptions = {
        ...this.barChartOptions,
        scales: {
          x: {
            min: -data.maxVolumeRange,
            max: data.maxVolumeRange,
          },
          y: {
            stacked: true,
          }
        }
      }
      this.barChartData = {
        labels: data.labelsData,
        datasets: [
          {
            label: 'Bid',
            backgroundColor: '#cc3300',
            data: data.bidData,
          }, {
            label: 'Ask',
            data: data.askData,
            backgroundColor: '#7093DB',
          }
        ],
      };
    }
  }

  public update(): void {
    const data = this.dataSlice()
    if (data) {
      this.barChartOptions = {
        ...this.barChartOptions,
        animation: {
          duration: 500,
          delay: 50
        },
        scales: {
          x: {
            min: -data.maxVolumeRange,
            max: data.maxVolumeRange,
          },
          y: {
            stacked: true,
          }
        }
      }
      this.barChartData = {
        ...this.barChartData,
        labels: data.labelsData,
        datasets: [
          {
            label: 'Bid',
            backgroundColor: '#cc3300',
            data: data.bidData,
          }, {
            label: 'Ask',
            data: data.askData,
            backgroundColor: '#7093DB',
          }
        ],
      };
      this.chart?.update();
    }
  }

  public animate(): void {
    const data = this.dataSlice()
    if (data) {
      this.barChartOptions = {
        ...this.barChartOptions,
        animation: {
          duration: 0,
          delay: 0,
        }
      }
      this.barChartData = {
        ...this.barChartData,
        labels: data.labelsData,
        datasets: [
          {
            label: 'Bid',
            backgroundColor: '#cc3300',
            data: data.bidData,
          }, {
            label: 'Ask',
            data: data.askData,
            backgroundColor: '#7093DB',
          }
        ],
      };
      this.chart?.update();
    }
  }
}
