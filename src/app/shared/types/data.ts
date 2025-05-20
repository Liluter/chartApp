export type OrderBookRecord = {
  Time: string;
} & {
  [key: string]: number | string;
};

export interface SliceData {
  // bidData: (number | null)[],
  bidData: { [k: string]: number },
  // askData: ([number, number] | number | null)[] | Map<number, number>,
  askData: { [k: string]: number },
  labelsData: number[] | any,
  time: string,
  maxVolumeRange: number,
}

export enum Action {
  PREV = 'prev',
  FIRST = 'first',
  PLAY = 'play',
  STOP = 'stop',
  LAST = 'last',
  VOLUME = 'volume',
  NEXT = 'next',
}