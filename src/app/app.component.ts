import { AfterViewInit, ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { ChartComponent } from './components/chart/chart.component';
import { Action } from './shared/types/data';
import { NavbarComponent } from './components/nabar/navbar.component';
import { OrdersService } from './services/orders.service';

@Component({
  selector: 'app-root',
  imports: [ChartComponent, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  @ViewChild(ChartComponent) chartComponent: ChartComponent | undefined
  @ViewChild(NavbarComponent) navbar: NavbarComponent | undefined
  private _orderService = inject(OrdersService)

  ngAfterViewInit() {
    if (this.chartComponent) {
      this._orderService.chartRef = this.chartComponent

      this.navbar?.clickEvent.subscribe(event => {
        switch (event) {
          case Action.FIRST: {
            this._orderService.first()
            break
          }
          case Action.NEXT: {
            this._orderService.next()

            break
          }
          case Action.PREV: {
            this._orderService.prev()

            break
          }
          case Action.LAST: {
            this._orderService.last()
            break
          }
          case Action.VOLUME: {
            this._orderService.toggleVolume()
            break
          }

          case Action.PLAY: {
            this._orderService.play()
            break
          }
          case Action.SPEED: {
            this._orderService.changeSpeed()
            break
          }
          case Action.STOP: {
            this._orderService.stop()
            break
          }
          default: return
        }
      })
    }
  }

}
