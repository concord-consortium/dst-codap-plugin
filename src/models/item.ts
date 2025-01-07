import { observable } from "mobx";

export interface IItem {
  date?: string;
  Day?: number;
  Latitude?: number;
  Longitude?: number;
  Month?: number;
  Year?: number;
}

export let items = observable.array<IItem>();

export function getDate(item: IItem) {
  // // We need at least a year. To make things simple we just use 2000 for now
  return Date.UTC(item.Year || 2000, (item.Month ?? 1) - 1, item.Day);
}
