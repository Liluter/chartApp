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
export class ChartComponent {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective<'bar'> | undefined;
  private _orderService = inject(OrdersService)
  readonly dataSlice: Signal<SliceData | null> = this._orderService.sliceData
  readonly currentFrame = this._orderService.current
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    // aspectRatio: 16 / 6,
    // aspectRatio: 1.2,
    indexAxis: 'y',
    // animation: {
    //   duration: 500,
    //   delay: 50
    // },
    scales: {
    },
    plugins: {
      title: {
        display: false,
        text: 'Order book',
      },
      legend: { position: 'chartArea' }
    },
  };
  public barChartType = 'bar' as const;
  public barChartData: ChartData<'bar', { [k: string]: number }> = {
    datasets: [{
      label: 'Ask',
      data: {},
      backgroundColor: '#7093DB',
    }, {
      label: 'Bid',
      backgroundColor: '#cc3300',
      data: {},
    },],
  };

  public update(): void {
    const data = this.dataSlice()
    if (data) {
      this.barChartOptions = {
        ...this.barChartOptions,
        animation: {
          duration: 200,
          delay: 0
        },
        scales: {
          x: {
            stacked: true,
            min: -data.maxVolumeRange,
            max: data.maxVolumeRange,
            title: {
              display: true,
              text: 'Volume',
              font: {
                size: 20,
                style: 'normal',
                lineHeight: 1.2
              },
              padding: { top: 0, bottom: 0 },
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Price',
              font: {
                size: 20,
                style: 'normal',
                lineHeight: 1.2
              },
              padding: { top: 0, bottom: 0 },
            }
          }
        }
      }
      this.barChartData = {
        ...this.barChartData,
        labels: data.labelsData,
        datasets: [{
          label: 'Ask',
          data: data.askData,
          backgroundColor: '#7093DB',
        },
        {
          label: 'Bid',
          backgroundColor: '#cc3300',
          data: data.bidData,
        },
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
          duration: 300,
          delay: 0,
        },
        scales: {
          ...this.barChartOptions?.scales,
          x: {
            min: -data.maxVolumeRange,
            max: data.maxVolumeRange,
            title: {
              display: true,
              text: 'Volume',
              font: {
                size: 20,
                style: 'normal',
                lineHeight: 1.2
              },
              padding: { top: 0, bottom: 0 },
            }
          },

        }
      }
      this.barChartData = {
        ...this.barChartData,
        labels: data.labelsData,
        datasets: [{
          label: 'Ask',
          data: data.askData,
          backgroundColor: '#7093DB',
        },
        {
          label: 'Bid',
          backgroundColor: '#cc3300',
          data: data.bidData,
        },
        ],
      };
      this.chart?.update();
    }
  }
}
