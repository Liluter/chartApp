import { Component, inject, output } from '@angular/core';
import { OrdersService } from '../../services/orders.service';
import { Action } from '../../shared/types/data'
@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  readonly clickEvent = output<Action>()
  private _orderService = inject(OrdersService)
  readonly action = Action
  readonly counter = this._orderService.current
  readonly toggleVolume = this._orderService.volume
  clickHandler(event: Action) {
    this.clickEvent.emit(event)
  }
}
