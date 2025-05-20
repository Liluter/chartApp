import { computed, effect, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { OrderBookRecord, SliceData } from '../shared/types/data';
import jsonData from './../shared/data.json'

import { ChartComponent } from '../components/chart/chart.component';
import { delay, Observable, of, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ajax } from 'rxjs/ajax';
import { HttpClient } from '@angular/common/http';
import { MapType } from '@angular/compiler';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {

  readonly orderBookRawData: OrderBookRecord[] = jsonData
  private dataArr$: Observable<OrderBookRecord[]> = of(this.orderBookRawData).pipe(takeUntilDestroyed(), delay(1000))

  readonly current = signal(1)
  private data: WritableSignal<OrderBookRecord[] | []> = signal([])
  readonly dataSlice: Signal<SliceData | null> = computed(() =>
    (this.data().length > 0 ? this.getOne(this.data()[this.current() - 1]) : null))
  chartRef!: ChartComponent;
  private globalMaxVolume: number = this.globalMaxVolumeValue(this.orderBookRawData)
  private intervalRef: any
  readonly playing = signal(false);
  readonly volumeRangeToggle = signal(false);
  readonly toggleSpeed: WritableSignal<1 | 2 | 3> = signal(1)
  constructor() {
    this.allLabels()
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
    this.current.set(this.orderBookRawData.length)
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

  play(duration?: number) {
    const durationTime = duration ?? 1000

    if (!this.intervalRef) {
      if (this.current() < 100) {
        this.playing.set(true)
        this.intervalRef = setInterval(() => {
          if (this.current() < 100) {
            this.current.update(c => c < 100 ? c + 1 : c)
            this.chartRef?.animate(durationTime / this.toggleSpeed())
          } else {
            clearInterval(this.intervalRef)
          }
        }, durationTime / this.toggleSpeed())
      }
    } else this.stop()
  }

  changeSpeed() {
    if (this.intervalRef) {
      this.playing.set(false)
      clearInterval(this.intervalRef)
      this.intervalRef = undefined
    }
    this.toggleSpeed.update(speed => speed === 3 ? 1 : speed === 1 ? 2 : 3)
  }

  toggleVolume() {
    this.volumeRangeToggle.update(vol => !this.volumeRangeToggle())
    this.chartRef.update()
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
    const labelsData = this.allLabels()
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
          bidMap.set(bidPrice, -bidSize);
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
  private askData(data: OrderBookRecord | undefined): { [k: string]: number } {
    if (data) {
      return Object.fromEntries(this.toAskBidMaps(data).askMap)
    } else return {}
  }
  private bidData(data: OrderBookRecord | undefined): { [k: string]: number } {
    if (data) {
      return Object.fromEntries(this.toAskBidMaps(data).bidMap)
    } else return {}
  }
  private maxVolumeRange(data: OrderBookRecord) {
    if (this.volumeRangeToggle()) {
      const minVolume: number = Object.values<number>(this.bidData(data)).sort((a: number, b: number) => a - b)[0]
      const maxVolume: number = Object.values<number>(this.askData(data)).sort((a: number, b: number) => b - a)[0]
      const theMax = Math.max(minVolume * -1, maxVolume)
      return theMax
    } else {
      return this.globalMaxVolume
    }
  }
  private globalMaxVolumeValue(rawData: OrderBookRecord[]): number {
    const askVolumes: number[] = []
    const bidVolumes: number[] = []
    rawData.forEach(data => {
      for (let i = 1; i <= 10; i++) {
        const askSizeKey = `Ask${i}Size`;
        const bidSizeKey = `Bid${i}Size`;
        const askSize = data[askSizeKey];
        const bidSize = data[bidSizeKey];
        if (typeof askSize === 'number') {
          askVolumes.push(askSize);
        }
        if (typeof bidSize === 'number') {
          bidVolumes.push(bidSize);
        }
      }
    }
    )
    const globalMaxVolume = Math.max(Math.max(...askVolumes), Math.max(...bidVolumes))
    return globalMaxVolume
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
  allLabels() {
    const newLabelsArr = this.orderBookRawData.map(el => this.getLabels(el))
    const flated = newLabelsArr.flat()
    const sorted = flated.sort((a, b) => b - a)
    const newSet = new Set(sorted)
    const newLabels = Array.from(newSet)
    const mappedSet = newLabels.map(l => l.toString())
    return mappedSet
  }
}


