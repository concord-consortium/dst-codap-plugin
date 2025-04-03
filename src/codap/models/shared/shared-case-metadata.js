"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedCaseMetadata = exports.AttributeBinningTypes = exports.CollectionTableMetadata = exports.kSharedCaseMetadataType = void 0;
exports.isSharedCaseMetadata = isSharedCaseMetadata;
exports.isSetIsCollapsedAction = isSetIsCollapsedAction;
var mobx_1 = require("mobx");
var mobx_state_tree_1 = require("mobx-state-tree");
var mst_utils_1 = require("../../utilities/mst-utils");
var category_set_1 = require("../data/category-set");
var data_set_1 = require("../data/data-set");
var apply_model_change_1 = require("../history/apply-model-change");
var shared_case_metadata_constants_1 = require("./shared-case-metadata-constants");
var shared_model_1 = require("./shared-model");
exports.kSharedCaseMetadataType = "SharedCaseMetadata";
exports.CollectionTableMetadata = mobx_state_tree_1.types.model("CollectionTable", {
    // key is valueJson; value is true (false values are deleted)
    collapsed: mobx_state_tree_1.types.map(mobx_state_tree_1.types.boolean)
});
var ColorRangeModel = mobx_state_tree_1.types.model("ColorRangeModel", {
    lowColor: shared_case_metadata_constants_1.kDefaultLowAttributeColor,
    highColor: shared_case_metadata_constants_1.kDefaultHighAttributeColor
})
    .actions(function (self) { return ({
    setLowColor: function (color) {
        self.lowColor = color;
    },
    setHighColor: function (color) {
        self.highColor = color;
    }
}); });
exports.AttributeBinningTypes = ["quantize", "quantile"];
// This is an object so it can be expanded in the future to store
// things like:
// - number of bins, or size of each bin
// - scale to be used for bins or axis (linear, log, square...)
// It is currently only used by the numeric legend to determine how to
// construct the choropleth scale
var AttributeScale = mobx_state_tree_1.types.model("AttributeScale", {
    binningType: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.enumeration(exports.AttributeBinningTypes))
});
exports.SharedCaseMetadata = shared_model_1.SharedModel
    .named(exports.kSharedCaseMetadataType)
    .props({
    type: mobx_state_tree_1.types.optional(mobx_state_tree_1.types.literal(exports.kSharedCaseMetadataType), exports.kSharedCaseMetadataType),
    data: mobx_state_tree_1.types.safeReference(data_set_1.DataSet),
    // key is collection id
    collections: mobx_state_tree_1.types.map(exports.CollectionTableMetadata),
    // key is attribute id
    categories: mobx_state_tree_1.types.map(category_set_1.CategorySet),
    // key is attribute id; value is true (false values are deleted)
    hidden: mobx_state_tree_1.types.map(mobx_state_tree_1.types.boolean),
    caseTableTileId: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string),
    caseCardTileId: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string),
    lastShownTableOrCardTileId: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string), // used to restore the last shown tile both have been hidden
    // key is attribute id
    attributeColorRanges: mobx_state_tree_1.types.map(ColorRangeModel),
    // key is attribute id
    attributeScales: mobx_state_tree_1.types.map(AttributeScale)
})
    .volatile(function (self) { return ({
    // CategorySets are generated whenever CODAP needs to treat an attribute categorically.
    // CategorySets only need to be saved, however, when they contain user modifications, e.g.
    // reordering categories or assigning colors to categories. Therefore, CategorySets
    // created automatically before any user modifications are treated as "provisional"
    // categories, which are then elevated to normal categories when they are modified by
    // the user. This also keeps them from cluttering up the undo history.
    provisionalCategories: mobx_1.observable.map()
}); })
    .views(function (self) { return ({
    // true if passed the id of a parent/pseudo-case whose child cases have been collapsed, false otherwise
    isCollapsed: function (caseId) {
        var _a, _b, _c;
        var _d = ((_a = self.data) === null || _a === void 0 ? void 0 : _a.caseInfoMap.get(caseId)) || {}, collectionId = _d.collectionId, valuesJson = _d.groupKey;
        return (_c = (collectionId && valuesJson && ((_b = self.collections.get(collectionId)) === null || _b === void 0 ? void 0 : _b.collapsed.get(valuesJson)))) !== null && _c !== void 0 ? _c : false;
    },
    // true if passed the id of a hidden attribute, false otherwise
    isHidden: function (attrId) {
        var _a;
        return (_a = self.hidden.get(attrId)) !== null && _a !== void 0 ? _a : false;
    },
    getAttributeColorRange: function (attrId) {
        var _a, _b, _c, _d;
        return {
            low: (_b = (_a = self.attributeColorRanges.get(attrId)) === null || _a === void 0 ? void 0 : _a.lowColor) !== null && _b !== void 0 ? _b : shared_case_metadata_constants_1.kDefaultLowAttributeColor,
            high: (_d = (_c = self.attributeColorRanges.get(attrId)) === null || _c === void 0 ? void 0 : _c.highColor) !== null && _d !== void 0 ? _d : shared_case_metadata_constants_1.kDefaultHighAttributeColor
        };
    },
    getAttributeBinningType: function (attrId) {
        var scale = self.attributeScales.get(attrId);
        return (scale === null || scale === void 0 ? void 0 : scale.binningType) || "quantile";
    }
}); })
    .actions(function (self) { return ({
    setData: function (data) {
        self.data = data;
    },
    setCaseTableTileId: function (tileId) {
        self.caseTableTileId = tileId;
    },
    setCaseCardTileId: function (tileId) {
        self.caseCardTileId = tileId;
    },
    setLastShownTableOrCardTileId: function (tileId) {
        self.lastShownTableOrCardTileId = tileId;
    },
    setIsCollapsed: function (caseId, isCollapsed) {
        var _a;
        var _b = ((_a = self.data) === null || _a === void 0 ? void 0 : _a.caseInfoMap.get(caseId)) || {}, collectionId = _b.collectionId, groupKey = _b.groupKey;
        if (collectionId && groupKey) {
            var tableCollection = self.collections.get(collectionId);
            if (isCollapsed) {
                if (!tableCollection) {
                    tableCollection = exports.CollectionTableMetadata.create();
                    self.collections.set(collectionId, tableCollection);
                }
                tableCollection.collapsed.set(groupKey, true);
            }
            else if (tableCollection) {
                tableCollection.collapsed.delete(groupKey);
            }
        }
    },
    setIsHidden: function (attrId, hidden) {
        if (hidden) {
            self.hidden.set(attrId, true);
        }
        else {
            self.hidden.delete(attrId);
        }
    },
    showAllAttributes: function () {
        self.hidden.clear();
    },
    setAttributeColor: function (attrId, color, selector) {
        var attributeColors = self.attributeColorRanges.get(attrId);
        if (!attributeColors) {
            attributeColors = ColorRangeModel.create();
            self.attributeColorRanges.set(attrId, attributeColors);
        }
        if (selector === "high") {
            attributeColors.setHighColor(color);
        }
        else {
            attributeColors.setLowColor(color);
        }
    },
    setAttributeBinningType: function (attrId, binningType) {
        var attributeScale = self.attributeScales.get(attrId);
        if (!attributeScale) {
            attributeScale = AttributeScale.create({ binningType: binningType });
            self.attributeScales.set(attrId, attributeScale);
        }
        else {
            attributeScale.binningType = binningType;
        }
    }
}); })
    .actions(function (self) { return ({
    removeCategorySet: function (attrId) {
        self.categories.delete(attrId);
        self.provisionalCategories.delete(attrId);
    }
}); })
    .actions(function (self) { return ({
    // moves a category set from the provisional map to the official one
    promoteProvisionalCategorySet: function (categorySet) {
        var attrId = categorySet.attribute.id;
        // add category set to official map
        self.categories.set(attrId, category_set_1.CategorySet.create((0, mobx_state_tree_1.getSnapshot)(categorySet)));
        // remove category set from provisional categories map
        self.provisionalCategories.delete(attrId);
        // remove category sets from map when attribute references are invalidated
        categorySet.onAttributeInvalidated(function (invalidAttrId) {
            self.removeCategorySet(invalidAttrId);
        });
    }
}); })
    .views(function (self) { return ({
    // returns an existing category set (if available) or creates a new provisional one (for valid attributes)
    getCategorySet: function (attrId) {
        var _a, _b;
        var categorySet = (_a = self.categories.get(attrId)) !== null && _a !== void 0 ? _a : self.provisionalCategories.get(attrId);
        if (!categorySet && ((_b = self.data) === null || _b === void 0 ? void 0 : _b.attrFromID(attrId))) {
            categorySet = (0, category_set_1.createProvisionalCategorySet)(self.data, attrId);
            self.provisionalCategories.set(attrId, categorySet);
            // remove category sets from map when attribute references are invalidated
            categorySet.onAttributeInvalidated(function (invalidAttrId) {
                self.removeCategorySet(invalidAttrId);
            });
            var userActionNames_1 = categorySet.userActionNames;
            (0, mst_utils_1.onAnyAction)(categorySet, function (action) {
                // when a category set is changed by the user, it is promoted to a regular CategorySet
                if (categorySet && userActionNames_1.includes(action.name)) {
                    self.promoteProvisionalCategorySet(categorySet);
                }
            });
        }
        return categorySet;
    }
}); })
    .actions(apply_model_change_1.applyModelChange);
function isSharedCaseMetadata(model) {
    return model ? (0, mobx_state_tree_1.getType)(model) === exports.SharedCaseMetadata : false;
}
function isSetIsCollapsedAction(action) {
    return action.name === "setIsCollapsed";
}
