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
  readonly dataSlice: Signal<SliceData | null> = this._orderService.dataSlice
  readonly currentFrame = this._orderService.current
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    animation: {
      duration: 1500,
      delay: 50
    },
    scales: {
    },
    plugins: {
      legend: { position: 'chartArea' }
    },
  };
  public barChartType = 'bar' as const;
  public barChartData: ChartData<'bar', { [k: string]: number }> = {
    labels: this.dataSlice()?.labelsData,
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
      this.barChartData.labels = data.labelsData
      this.barChartData.datasets[0].data = data.askData
      this.barChartData.datasets[1].data = data.bidData
      this.chart?.update();
    }
  }

  public animate(duration?: number): void {
    const durationTime = duration ?? 1600
    const data = this.dataSlice()
    if (data) {
      this.barChartOptions = {
        ...this.barChartOptions,
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
      this.barChartOptions.animation = { duration: durationTime }
      this.barChartData.datasets[0].data = data.askData
      this.barChartData.datasets[1].data = data.bidData
      this.chart?.update();
    }
  }
}
