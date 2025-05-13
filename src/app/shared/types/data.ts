export type OrderBookRecord = {
  Time: string;
} & {
  [key: string]: number | string;
};

export interface SliceData {
  bidData: (number | null)[],
  askData: (number | null)[],
  labelsData: number[],
  time: string,
  maxVolumeRange: number,
}

export enum Action {
  PREV = 'prev',
  FIRST = 'first',
  PLAY = 'play',
  STOP = 'stop',
  LAST = 'last',
  NEXT = 'next',
}