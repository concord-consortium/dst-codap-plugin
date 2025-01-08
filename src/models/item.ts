import { makeAutoObservable, observable } from "mobx";

export interface IItem {
  date?: string;
  Day?: number;
  id: number;
  Latitude?: number;
  Longitude?: number;
  Month?: number;
  Year?: number;
}

class DSTItems {
  itemMap = observable.map<number, IItem>();

  constructor() {
    makeAutoObservable(this);
  }

  addItem(item: IItem) {
    this.itemMap.set(item.id, item);
  }

  get values(): IItem[] {
    return Array.from(this.itemMap.values());
  }

  replaceItems(newItems: Record<number, IItem>) {
    this.itemMap.replace(newItems);
  }
}

export const items = new DSTItems();

export function getDate(item: IItem) {
  // // We need at least a year. To make things simple we just use 2000 for now
  return Date.UTC(item.Year || 2000, (item.Month ?? 1) - 1, item.Day);
}
