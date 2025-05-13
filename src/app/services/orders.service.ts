import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { OrderBookRecord, SliceData } from '../shared/types/data';
import data from './../shared/data.json'

import { ChartComponent } from '../components/chart/chart.component';
import { delay, Observable, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  readonly dataArr: OrderBookRecord[] = data
  dataArr$: Observable<OrderBookRecord[]> = of(this.dataArr).pipe(takeUntilDestroyed(), delay(1000))
  readonly current = signal(1)
  private data: WritableSignal<OrderBookRecord[] | []> = signal([])
  readonly sliceData: Signal<SliceData | null> = computed(() =>
    (this.data().length > 0 ? this.getOne(this.data()[this.current() - 1]) : null))
  chartRef!: ChartComponent;
  private intervalRef: any
  readonly playing = signal(false);

  constructor() {
    this.dataArr$.subscribe(data => {
      this.data.set(data);
      this.chartRef.update()
    })
  }

  first() {
    this.current.set(1)
    this.chartRef?.update()
  }

  last() {
    this.current.set(this.dataArr.length)
    this.chartRef?.update()
  }

  next() {
    if (!this.intervalRef) {
      if (this.current() < 100) {
        this.current.update(c => c < 100 ? c + 1 : c)
        this.chartRef?.update()
      }
    } else this.stop()
  }

  prev() {
    if (!this.intervalRef) {
      this.current.update(c => c > 1 ? c - 1 : c)
      this.chartRef?.update()
    } else this.stop()
  }

  play() {
    if (!this.intervalRef) {
      if (this.current() < 100) {
        this.playing.set(true)
        this.intervalRef = setInterval(() => {
          if (this.current() < 100) {
            this.current.update(c => c < 100 ? c + 1 : c)
            this.chartRef?.animate()
          } else {
            clearInterval(this.intervalRef)
          }
        }, 300)
      }
    } else this.stop()
  }

  stop() {
    if (this.intervalRef) {
      this.playing.set(false)
      clearInterval(this.intervalRef)
      this.intervalRef = undefined
    } else {
      this.first()
    }
  }

  private getOne(record: OrderBookRecord) {
    const labelsData = this.getLabels(record)
    const askData = this.askData(record)
    const bidData = this.bidData(record)
    const maxVolumeRange = this.maxVolumeRange(record)
    const time = this.timeOnlyFormat(record.Time)
    return { askData: askData, bidData: bidData, labelsData: labelsData, maxVolumeRange: maxVolumeRange, time: time }
  }
  private toAskBidMaps(entry: Record<string, string | number> | undefined): {
    askMap: Map<number, number>,
    bidMap: Map<number, number>
  } {
    const askMap = new Map<number, number>();
    const bidMap = new Map<number, number>();
    if (entry) {

      for (let i = 1; i <= 10; i++) {
        const askKey = `Ask${i}`;
        const askSizeKey = `Ask${i}Size`;
        const bidKey = `Bid${i}`;
        const bidSizeKey = `Bid${i}Size`;

        const askPrice = entry[askKey];
        const askSize = entry[askSizeKey];
        const bidPrice = entry[bidKey];
        const bidSize = entry[bidSizeKey];

        if (typeof askPrice === 'number' && typeof askSize === 'number') {
          askMap.set(askPrice, askSize);
        }

        if (typeof bidPrice === 'number' && typeof bidSize === 'number') {
          bidMap.set(bidPrice, bidSize);
        }
      }

      return { askMap, bidMap };
    } else return { askMap, bidMap }
  }

  private getLabels(data: OrderBookRecord | undefined) {
    if (data) {

      return [...Array.from(this.toAskBidMaps(data).bidMap).map(el => el[0]), ...Array.from(this.toAskBidMaps(data).askMap).map(el => el[0])].sort((a, b) => b - a)
    } else return []
  }
  private askData(data: OrderBookRecord | undefined): (number | null)[] {
    if (data) {
      return [...Array.from(this.toAskBidMaps(data).askMap).reverse().map(el => el[1]), ...Array.from(this.toAskBidMaps(data).bidMap).map(el => null)]

    } else return []
  }
  private bidData(data: OrderBookRecord | undefined): (number | null)[] {
    if (data) {
      return [...Array.from(this.toAskBidMaps(data).askMap).map(el => null), ...Array.from(this.toAskBidMaps(data).bidMap).map(el => el[1] * -1)]

    } else return []
  }
  private maxVolumeRange(data: OrderBookRecord) {
    const minVolume = [...this.bidData(data)].filter(el => el !== null).sort((a, b) => a - b)[0];
    const maxVolume = [...this.askData(data)].filter(el => el !== null).sort((a, b) => b - a)[0]
    const theMax = Math.max(minVolume, maxVolume)
    return theMax
  }
  public timeOnlyFormat(timeString: string | undefined, format: string = 'HH:mm:ss'): string {
    if (!timeString) {
      return '';
    }
    const parts = timeString.split(':');
    if (parts.length !== 3) {
      return 'Wrong time format';
    }
    const hours = parts[0];
    const minutes = parts[1];
    const [seconds, milliseconds] = parts[2].split('.');
    let formattedTime = format;
    formattedTime = formattedTime.replace('HH', hours);
    formattedTime = formattedTime.replace('mm', minutes);
    formattedTime = formattedTime.replace('ss', seconds);
    const ms = milliseconds || '';
    formattedTime = formattedTime.replace('SSS', ms.substring(0, Math.min(ms.length, 3)));
    formattedTime = formattedTime.replace('SSSSSS', ms);
    return formattedTime;
  }
}


