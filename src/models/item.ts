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
  return new Date(`${item.Year}-${item.Month}-${item.Day}`).getTime();
}
