import { makeAutoObservable } from "mobx";

import vars from "../../codap/components/vars.scss";
import { getStringBounds } from "../../codap/components/axis/axis-utils";
import { axisGap } from "../../codap/components/axis/axis-types";
import { DataDisplayLayout } from "../../codap/components/data-display/models/data-display-layout";
import { IDataConfigurationModel } from "../../codap/components/data-display/models/data-configuration-model";
import { kDataDisplayFont, kMain } from "../../codap/components/data-display/data-display-types";
import { measureText } from "../../codap/hooks/use-measure-text";
import { logMessageWithReplacement } from "../../codap/lib/log-message";
import { defaultPointDiameter, IDstDataConfigurationModel } from "../../models/dst-data-configuration-model";

export interface CategoricalSizeLegendKey {
  category: string;
  size: number;
  index: number;
  column: number;
  row: number;
}
interface Layout {
  maxWidth: number;
  fullWidth: number;
  numColumns: number;
  numRows: number;
  columnWidth: number;
  rowHeight: number;
}

export const keySize = 15;
export const padding = 5;
export const labelHeight = getStringBounds("Wy", vars.labelFont).height + axisGap;

// TODO: try extending the CategoryLegendModel
// we have to understand what works and what doesn't work with MobX sub classing
export class CategoricalSizeLegendModel {
  dragInfo = {
    category: "",
    initialOffset: { x: 0, y: 0 },
    currentDragPosition: { x: 0, y: 0 },
    initialIndex: -1,
    currentIndex: -1
  };

  dataDisplayLayout: DataDisplayLayout;
  dataConfiguration: IDstDataConfigurationModel | undefined;

  categoriesAtDragStart: string[] = [];
  colorsAtDragStart: Record<string, string> = {};
  sizesAtDragStart: Record<string, number> = {};

  constructor(dataConfiguration: IDstDataConfigurationModel | undefined, dataDisplayLayout: DataDisplayLayout) {
    this.dataDisplayLayout = dataDisplayLayout;
    this.dataConfiguration = dataConfiguration;
    makeAutoObservable(this);
  }

  setDataConfiguration(dataConfiguration: IDstDataConfigurationModel | undefined) {
    this.dataConfiguration = dataConfiguration;
  }

  setDataDisplayLayout(dataDisplayLayout: DataDisplayLayout) {
    this.dataDisplayLayout = dataDisplayLayout;
  }

  get categoriesFromDoc() {
    const categories = this.dataConfiguration?.categoryArrayForAttrRole("legend") || [];
    return categories.filter(cat => cat !== kMain);
  }

  getSizeForCategoryFromDoc(cat: string) {
    return this.dataConfiguration?.getLegendSizeForCategory(cat) || defaultPointDiameter;
  }

  get numCategories() {
    return this.categoriesFromDoc.length;
  }

  get categoryTextMaxWidth() {
    let maxWidth = 0;
    this.categoriesFromDoc.forEach(cat => {
      maxWidth = Math.max(maxWidth, measureText(cat, kDataDisplayFont));
    });
    return maxWidth;
  }

  get categoryCircleMaxDiameter() {
    let maxWidth = 0;
    this.categoriesFromDoc.forEach(cat => {
      // This doesn't include the width of the stroke of the circle. 
      // This stroke varies from 1 to 3 px.
      // Because the stroke is centered on the outside edge of the circle
      // This will make the actual diameter of the circle vary from 1 to 3 px.
      maxWidth = Math.max(maxWidth, this.getSizeForCategoryFromDoc(cat));
    });
    return maxWidth;
  }

  get layoutData() {
    const fullWidth = this.dataDisplayLayout.tileWidth;
    const maxWidth = this.categoryTextMaxWidth + this.categoryCircleMaxDiameter + padding;
    const numColumns = Math.max(Math.floor(fullWidth / maxWidth), 1);
    const columnWidth = fullWidth / numColumns;
    const numRows = Math.ceil((this.numCategories ?? 0) / numColumns);
    const rowHeight = this.categoryCircleMaxDiameter + padding;

    const lod: Layout = {
      fullWidth,
      maxWidth,
      numColumns,
      columnWidth,
      numRows,
      rowHeight
    };

    return lod;
  }

  coordinatesToCatIndex(localPoint: { x: number; y: number; }) {
    const { x, y } = localPoint;
    const col = Math.floor(x / this.layoutData.columnWidth);
    const row = Math.floor(y / this.layoutData.rowHeight);
    const catIndex = row * this.layoutData.numColumns + col;

    return catIndex >= 0 && catIndex < this.numCategories ? catIndex : -1;
  }

  catLocation(categoryKey: CategoricalSizeLegendKey) {
    return {
      x: axisGap + categoryKey.column * this.layoutData.columnWidth,
      y: categoryKey.row * this.layoutData.rowHeight
    };
  }

  get isDragging() {
    return !!this.dragInfo.category;
  }

  getSizeForCategory(cat: string) {
    if (this.isDragging) {
      return this.sizesAtDragStart[cat] || defaultPointDiameter;
    } else {
      return this.getSizeForCategoryFromDoc(cat);
    }
  }

  get categoryData() {
    const categories = this.isDragging ? this.getCategoriesDuringDrag() : this.categoriesFromDoc;

    return categories.map((cat: string, index) => ({
      category: cat,
      size: this.getSizeForCategory(cat),
      column: index % this.layoutData.numColumns,
      index,
      row: Math.floor(index / this.layoutData.numColumns)
    }));
  }

  onDragStart(event: { x: number; y: number; }, d: CategoricalSizeLegendKey) {
    const localPt = {
      x: event.x,
      y: event.y - labelHeight
    };
    const keyLocation = this.catLocation(d);

    this.categoriesAtDragStart = this.categoriesFromDoc;
    // TODO: saving the colors is probably not necessary
    // They shouldn't be changing while we are dragging since the dragging doesn't
    // change the document
    this.categoriesAtDragStart.forEach(cat => {
      this.sizesAtDragStart[cat] = this.getSizeForCategoryFromDoc(cat);
    });

    const dI = this.dragInfo;
    // We save the information but we don't save the dragging category to indicate we are
    // dragging. This prevents extra re-renders on single clicks
    dI.initialOffset = { x: localPt.x - keyLocation.x, y: localPt.y - keyLocation.y };
    dI.currentDragPosition = localPt;
    dI.initialIndex = d.index;
    dI.currentIndex = d.index;
  }

  onDrag(event: { dx: number; dy: number; }, d: CategoricalSizeLegendKey) {
    if (event.dx !== 0 || event.dy !== 0) {
      const dI = this.dragInfo;

      // Indicate that we are now dragging
      dI.category = d.category;

      const newDragPosition = {
        x: dI.currentDragPosition.x + event.dx,
        y: dI.currentDragPosition.y + event.dy
      };

      dI.currentIndex = this.coordinatesToCatIndex(newDragPosition);
      dI.currentDragPosition = newDragPosition;
    }
  }

  onDragEnd(
    dataConfiguration: IDataConfigurationModel | undefined, d: CategoricalSizeLegendKey
  ) {
    const categories = dataConfiguration?.categoryArrayForAttrRole("legend") || [];
    const dI = this.dragInfo;

    const targetCategory = categories[dI.currentIndex];

    if (dI.currentIndex === dI.initialIndex) {
      // Nothing changed so stop the drag and do nothing else.
      dI.category = "";
    } else {
      // TODO: This is calling a MST action inside of a MobX action, it might be why undo and redo
      // Isn't always working properly. If that is true, we can annotate it so onDragEnd itself isn't a
      // MobX action
      dataConfiguration?.applyModelChange(() => {
        dataConfiguration?.storeAllCurrentColorsForAttrRole("legend");
        let beforeCategory: string | undefined = "";
        if (dI.currentIndex > dI.initialIndex) {
          // The gap is on the left of where we want the dragged category to go so we want to
          // go before the category to the right of our target position. If we are at the end then we use
          // a special undefined value to indicate we want go to the last position
          beforeCategory = dI.currentIndex < categories.length - 1 ? categories[dI.currentIndex + 1] : undefined;
        } else {
          // The gap is on the right of where we want the dragged category to go so we want to
          // go before the category at our target position. This will push all of the categories right.
          beforeCategory = categories[dI.currentIndex];
        }
        const categorySet = dataConfiguration?.categorySetForAttrRole("legend");
        categorySet?.move(dI.category, beforeCategory);
        dI.category = "";
      }, {
        undoStringKey: "DG.Undo.graph.swapCategories",
        redoStringKey: "DG.Redo.graph.swapCategories",
        log: logMessageWithReplacement(
          "Moved category %@ into position of %@",
          {
            movedCategory: d.category,
            targetCategory
          })
      });
    }
  }

  getCategoriesDuringDrag() {
    const { dragInfo } = this;
    if (dragInfo.currentIndex === dragInfo.initialIndex) return this.categoriesAtDragStart;

    const updatedCategories: string[] = [];
    this.categoriesAtDragStart.forEach((cat, index) => {
      // Ignore the old location
      if (cat === dragInfo.category) return;

      if (index !== dragInfo.currentIndex) {
        // If we aren't at the location of the dragged category just
        // add the original category
        updatedCategories.push(cat);
      } else {
        if (dragInfo.currentIndex < dragInfo.initialIndex) {
          // If the "gap" is after our location add the dragged category first
          // then add the category that was in this spot previously
          updatedCategories.push(dragInfo.category);
          updatedCategories.push(cat);
        } else {
          // If the "gap" is before our location add the original category first
          // and then our draged category second
          updatedCategories.push(cat);
          updatedCategories.push(dragInfo.category);
        }
      }
    });
    return updatedCategories;
  }
}
