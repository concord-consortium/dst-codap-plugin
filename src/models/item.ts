import { observable } from "mobx";

export interface IItem {
  date?: string;
  Latitude?: number;
  Longitude?: number;
}

export let items = observable.array<IItem>();
