"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataConfigurationModel = exports.kDataConfigurationType = exports.kUnknownDataConfigurationType = exports.AttributeDescription = void 0;
exports.getProvisionalDataSet = getProvisionalDataSet;
exports.getProvisionalMetadata = getProvisionalMetadata;
exports.isFilterFormulaDataConfiguration = isFilterFormulaDataConfiguration;
var d3_1 = require("d3");
var mobx_1 = require("mobx");
var mobx_state_tree_1 = require("mobx-state-tree");
var apply_model_change_1 = require("../../../models/history/apply-model-change");
var mst_utils_1 = require("../../../utilities/mst-utils");
var math_utils_1 = require("../../../utilities/math-utils");
var date_utils_1 = require("../../../utilities/date-utils");
var attribute_types_1 = require("../../../models/data/attribute-types");
var data_set_1 = require("../../../models/data/data-set");
var data_set_utils_1 = require("../../../models/data/data-set-utils");
var data_display_value_utils_1 = require("../data-display-value-utils");
var shared_case_metadata_1 = require("../../../models/shared/shared-case-metadata");
var data_set_actions_1 = require("../../../models/data/data-set-actions");
var filtered_cases_1 = require("../../../models/data/filtered-cases");
var formula_1 = require("../../../models/formula/formula");
var shared_case_metadata_constants_1 = require("../../../models/shared/shared-case-metadata-constants");
var js_utils_1 = require("../../../utilities/js-utils");
var color_utils_1 = require("../../../utilities/color-utils");
var data_utils_1 = require("../../../utilities/data-utils");
var choropleth_legend_1 = require("../components/legend/choropleth-legend/choropleth-legend");
var data_display_types_1 = require("../data-display-types");
exports.AttributeDescription = mobx_state_tree_1.types
    .model('AttributeDescription', {
    attributeID: mobx_state_tree_1.types.string,
    // user-specified type, e.g. treat as numeric
    type: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.enumeration(__spreadArray([], attribute_types_1.attributeTypes, true)))
})
    .actions(function (self) { return ({
    setType: function (type) {
        self.type = type;
    }
}); });
exports.kUnknownDataConfigurationType = "unknownDataConfigurationType";
exports.kDataConfigurationType = "dataConfigurationType";
function getProvisionalDataSet(node) {
    var env = node && (0, mobx_state_tree_1.hasEnv)(node) ? (0, mobx_state_tree_1.getEnv)(node) : {};
    return env.provisionalDataSet;
}
function getProvisionalMetadata(node) {
    var env = node && (0, mobx_state_tree_1.hasEnv)(node) ? (0, mobx_state_tree_1.getEnv)(node) : {};
    return env.provisionalMetadata;
}
exports.DataConfigurationModel = mobx_state_tree_1.types
    .model('DataConfigurationModel', {
    id: mobx_state_tree_1.types.optional(mobx_state_tree_1.types.identifier, function () { return (0, js_utils_1.typedId)("DCON"); }),
    type: mobx_state_tree_1.types.optional(mobx_state_tree_1.types.string, exports.kDataConfigurationType),
    // keys are AttrRoles, excluding y role
    _attributeDescriptions: mobx_state_tree_1.types.map(exports.AttributeDescription),
    dataset: mobx_state_tree_1.types.safeReference(data_set_1.DataSet, {
        get: function (identifier, parent) {
            var _a;
            return (_a = getProvisionalDataSet(parent)) !== null && _a !== void 0 ? _a : (0, mobx_state_tree_1.resolveIdentifier)(data_set_1.DataSet, parent, identifier);
        },
        set: function (dataSet) {
            return dataSet.id;
        }
    }),
    metadata: mobx_state_tree_1.types.safeReference(shared_case_metadata_1.SharedCaseMetadata, {
        get: function (identifier, parent) {
            var _a;
            return (_a = getProvisionalMetadata(parent)) !== null && _a !== void 0 ? _a : (0, mobx_state_tree_1.resolveIdentifier)(shared_case_metadata_1.SharedCaseMetadata, parent, identifier);
        },
        set: function (metadata) {
            return metadata.id;
        }
    }),
    hiddenCases: mobx_state_tree_1.types.array(mobx_state_tree_1.types.string),
    displayOnlySelectedCases: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.boolean),
    filterFormula: mobx_state_tree_1.types.maybe(formula_1.Formula)
})
    .volatile(function () { return ({
    actionHandlerDisposer: undefined,
    filteredCases: mobx_1.observable.array([], { deep: false }),
    handlers: new Map(),
    pointsNeedUpdating: false,
    casesChangeCount: 0,
    // cached result of filter formula evaluation for each case ID
    filteredOutCaseIds: mobx_1.observable.set(),
    filterFormulaError: "",
    // The following is set in useSubAxis:setupCategories based on how many fit in available space
    numberOfCategoriesLimitByRole: mobx_1.observable.map()
}); })
    .views(function (self) { return ({
    get axisAttributeIDs() {
        var _this = this;
        // Note that 'caption' and 'legend' are not roles we include here
        return ['x', 'y', 'rightNumeric', 'topSplit', 'rightSplit', 'lat', 'long', 'polygon']
            .map(function (aRole) { return _this.attributeID(aRole); })
            .filter(function (id) { return !!id; });
    },
    get childmostCollectionIDForAxisAttributes() {
        return (0, data_set_utils_1.idOfChildmostCollectionForAttributes)(this.axisAttributeIDs, self.dataset);
    },
    get isEmpty() {
        return self._attributeDescriptions.size === 0;
    },
    get attributeDescriptions() {
        return (0, mobx_state_tree_1.getSnapshot)(self._attributeDescriptions);
    },
    get attributeDescriptionsStr() {
        return JSON.stringify(this.attributeDescriptions);
    },
    attributeDescriptionForRole: function (role) {
        return this.attributeDescriptions[role];
    },
    // returns empty string (rather than undefined) for roles without attributes
    attributeID: function (role) {
        var _this = this;
        var _a;
        var defaultCaptionAttributeID = function () {
            var _a, _b, _c;
            // We find the childmost collection and return the first attribute in that collection. If there is no
            // childmost collection, we return the first attribute in the dataset.
            var attrIDs = ['x', 'y', 'rightNumeric', 'topSplit', 'rightSplit', 'legend', 'lat', 'long']
                .map(function (aRole) { return _this.attributeID(aRole); })
                .filter(function (id) { return !!id; }), childmostCollectionID = (0, data_set_utils_1.idOfChildmostCollectionForAttributes)(attrIDs, self.dataset);
            if (childmostCollectionID) {
                var childmostCollection = (_a = self.dataset) === null || _a === void 0 ? void 0 : _a.getCollection(childmostCollectionID), childmostCollectionAttributes = childmostCollection === null || childmostCollection === void 0 ? void 0 : childmostCollection.attributes;
                if (childmostCollectionAttributes === null || childmostCollectionAttributes === void 0 ? void 0 : childmostCollectionAttributes.length) {
                    var firstAttribute = childmostCollectionAttributes[0];
                    return firstAttribute === null || firstAttribute === void 0 ? void 0 : firstAttribute.id;
                }
            }
            return (_c = (_b = self.dataset) === null || _b === void 0 ? void 0 : _b.childCollection.attributes[0]) === null || _c === void 0 ? void 0 : _c.id;
        };
        var attrID = ((_a = this.attributeDescriptionForRole(role)) === null || _a === void 0 ? void 0 : _a.attributeID) || "";
        if ((role === "caption") && !attrID) {
            attrID = defaultCaptionAttributeID() || "";
        }
        return attrID;
    },
    attributeType: function (role) {
        var _a;
        var desc = this.attributeDescriptionForRole(role);
        if (desc === null || desc === void 0 ? void 0 : desc.type) {
            return desc.type;
        }
        var attrID = this.attributeID(role);
        var attr = attrID ? (_a = self.dataset) === null || _a === void 0 ? void 0 : _a.attrFromID(attrID) : undefined;
        return attr === null || attr === void 0 ? void 0 : attr.type;
    },
    roleForAttributeWithCategoryLimit: function (attrID) {
        return data_display_types_1.GraphSplitAttrRoles.find(function (role) {
            return self.numberOfCategoriesLimitByRole.get(role) !== undefined;
        });
    },
    get places() {
        var _a;
        var places = new Set(Object.keys(this.attributeDescriptions));
        ((_a = self.dataset) === null || _a === void 0 ? void 0 : _a.attributes.length) && places.add("caption");
        return Array.from(places);
    },
    rolesForAttribute: function (attrID) {
        var roles = [];
        self._attributeDescriptions.forEach(function (desc, role) {
            if ((desc === null || desc === void 0 ? void 0 : desc.attributeID) === attrID) {
                roles.push(role);
            }
        });
        return roles;
    },
    get hiddenCasesSet() {
        return new Set(self.hiddenCases);
    },
}); })
    .actions(function (self) { return ({
    clearFilteredCases: function () {
        self.filteredCases.forEach(function (aFilteredCases) { return aFilteredCases.destroy(); });
        self.filteredCases.clear();
    },
    beforeDestroy: function () {
        var _a;
        this.clearFilteredCases();
        (_a = self.actionHandlerDisposer) === null || _a === void 0 ? void 0 : _a.call(self);
    },
    _setAttributeDescription: function (iRole, iDesc) {
        if (iDesc === null || iDesc === void 0 ? void 0 : iDesc.attributeID) {
            self._attributeDescriptions.set(iRole, iDesc);
        }
        else {
            self._attributeDescriptions.delete(iRole);
        }
    },
    setPointsNeedUpdating: function (needUpdating) {
        self.pointsNeedUpdating = needUpdating;
    }
}); })
    .views(function (self) { return ({
    _caseHasValidValuesForDescriptions: function (data, caseID, descriptions) {
        return Object.entries(descriptions).every(function (_a) {
            var role = _a[0], attributeID = _a[1].attributeID;
            // can still plot the case without a caption or a legend
            if (["caption", "legend"].includes(role))
                return true;
            switch (self.attributeType(role)) {
                case "numeric":
                    return (0, math_utils_1.isFiniteNumber)(data.getNumeric(caseID, attributeID));
                default:
                    // for now, all other types must just be non-empty
                    return !!data.getValue(caseID, attributeID);
            }
        });
    },
    // This function can be called either here in this base class or in a subclass to handle the situation in which
    // caseArrayNumber === 0.
    _filterCase: function (data, caseID) {
        // If the case is hidden or filtered out we don't plot it.
        // Also, if displayOnlySelectedCases is true, we only plot selected cases.
        if (self.hiddenCasesSet.has(caseID) || self.filteredOutCaseIds.has(caseID) ||
            (self.displayOnlySelectedCases && self.dataset && !self.dataset.isCaseSelected(caseID))) {
            return false;
        }
        return this._caseHasValidValuesForDescriptions(data, caseID, self.attributeDescriptions);
    },
}); })
    .views(function (self) { return ({
    filterCase: function (data, caseID, caseArrayNumber) {
        return self._filterCase(data, caseID);
    }
}); })
    .views(function (self) { return ({
    get hasFilterFormula() {
        return !!self.filterFormula && !self.filterFormula.empty;
    },
    get attributes() {
        return self.places.map(function (place) { return self.attributeID(place); }).filter(function (attrID) { return !!attrID; });
    },
    get uniqueAttributes() {
        return Array.from(new Set(this.attributes));
    },
    get tipAttributes() {
        return data_display_types_1.TipAttrRoles
            .map(function (role) {
            return { role: role, attributeID: self.attributeID(role) || '' };
        })
            .filter(function (pair) { return !!pair.attributeID; });
    },
    get uniqueTipAttributes() {
        var tipAttributes = this.tipAttributes, idCounts = {};
        tipAttributes.forEach(function (aPair) {
            idCounts[aPair.attributeID] = (idCounts[aPair.attributeID] || 0) + 1;
        });
        return tipAttributes.filter(function (aPair) {
            if (idCounts[aPair.attributeID] > 1) {
                idCounts[aPair.attributeID]--;
                return false;
            }
            return true;
        });
    },
    get noAttributesAssigned() {
        // The first attribute is always assigned as 'caption'. So it's really no attributes assigned except for that
        return this.attributes.length <= 1;
    },
    /**
     * Return all cases that are plotted at least once:
     * - set aside cases in the dataset should be excluded
     * - cases filtered by the filter formula in the dataset should be excluded
     * - cases hidden in the visualization should be excluded
     * - cases filtered by the filter formula in the visualization should be excluded
     * - cases that do not have valid values for the configured role attribute descriptions. And example is
     *   when a case has a non-numeric value for a numeric axis. If the case can be shown multiple times,
     *   all instances have to be invalid for it to be excluded.
     */
    get visibleCaseIds() {
        var allCaseIds = new Set();
        self.filteredCases.forEach(function (aFilteredCases) {
            if (aFilteredCases) {
                aFilteredCases.caseIds.forEach(function (id) { return allCaseIds.add(id); });
            }
        });
        return allCaseIds;
    },
    /**
     * Note that in order to eliminate a selected case from the graph's selection, we have to check that it is not
     * present in any of the case sets, not just the 0th one.
     */
    get selection() {
        if (!self.dataset)
            return [];
        return Array.from(this.visibleCaseIds).filter(function (caseId) { var _a; return (_a = self.dataset) === null || _a === void 0 ? void 0 : _a.isCaseSelected(caseId); });
    },
    /**
     * This returns an array of the visible cases that are unselected.
     * If displayOnlySelectedCases is enabled, this will return an empty set.
     */
    get unselectedCases() {
        if (!self.dataset)
            return [];
        return Array.from(this.visibleCaseIds).filter(function (caseId) { var _a; return !((_a = self.dataset) === null || _a === void 0 ? void 0 : _a.isCaseSelected(caseId)); });
    }
}); })
    .views(function (self) { return ({
    // Note that we have to go through each of the filteredCases in order to return all the values
    valuesForAttrRole: (0, mst_utils_1.cachedFnWithArgsFactory)({
        key: function (role) { return role; },
        calculate: function (role) {
            var attrID = self.attributeID(role);
            var dataset = self.dataset;
            var allCaseIDs = Array.from(self.visibleCaseIds);
            var allValues = attrID ? allCaseIDs.map(function (anID) { return dataset === null || dataset === void 0 ? void 0 : dataset.getStrValue(anID, attrID); }) : [];
            return allValues.filter(function (aValue) { return aValue; });
        },
        name: "valuesForAttrRole"
    })
}); })
    .views(function (self) { return ({
    /**
     * This returns just values which can be converted to numbers for the
     * attribute of this role. It does not include all cases, see `visibleCaseIds`.
     * TODO: it seems better if this included unselected cases when displayOnlySelectedCases is enabled
     */
    numericValuesForAttrRole: (0, mst_utils_1.cachedFnWithArgsFactory)({
        key: function (role) { return role; },
        calculate: function (role) {
            var attrID = self.attributeID(role);
            var dataset = self.dataset;
            var allCaseIDs = Array.from(self.visibleCaseIds);
            var allValues = attrID
                ? allCaseIDs.map(function (anID) {
                    var value = (0, data_display_value_utils_1.dataDisplayGetNumericValue)(dataset, anID, attrID);
                    return (0, math_utils_1.isFiniteNumber)(value) ? value : null;
                }) : [];
            return allValues.filter(function (aValue) { return aValue != null; });
        },
        name: "numericValuesForAttrRole"
    }),
    categorySetForAttrRole: function (role) {
        if (self.metadata) {
            var attributeID = self.attributeID(role) || '';
            return self.metadata.getCategorySet(attributeID);
        }
    },
    get categoricalRoles() {
        return self.attributeType("legend") === "categorical" ? ["legend"] : [];
    }
}); })
    .views(function (self) { return ({
    /**
     * @param role
     * @param emptyCategoryArray
     */
    categoryArrayForAttrRole: (0, mst_utils_1.cachedFnWithArgsFactory)({
        key: function (role, emptyCategoryArray) {
            if (emptyCategoryArray === void 0) { emptyCategoryArray = [data_display_types_1.kMain]; }
            return JSON.stringify({ role: role, emptyCategoryArray: emptyCategoryArray });
        },
        calculate: function (role, emptyCategoryArray) {
            if (emptyCategoryArray === void 0) { emptyCategoryArray = [data_display_types_1.kMain]; }
            var valuesSet = new Set(self.valuesForAttrRole(role)), categoryLimitForRole = self.numberOfCategoriesLimitByRole.get(role);
            if (valuesSet.size === 0)
                return emptyCategoryArray;
            var resultArray = [];
            // category set maintains the canonical order of categories
            var allCategorySet = self.categorySetForAttrRole(role);
            // if we don't have a category set just return the values
            if (!allCategorySet && valuesSet.size > 0) {
                resultArray = Array.from(valuesSet);
            }
            else {
                // return the categories in canonical order
                allCategorySet === null || allCategorySet === void 0 ? void 0 : allCategorySet.values.forEach(function (category) {
                    if (valuesSet.has(category)) {
                        resultArray.push(category);
                    }
                });
                if (categoryLimitForRole && resultArray.length > categoryLimitForRole) {
                    resultArray.length = categoryLimitForRole;
                    resultArray[categoryLimitForRole - 1] = data_display_types_1.kOther;
                }
            }
            return resultArray;
        },
        name: "categoryArrayForAttrRole"
    }),
    get allCategoriesForRoles() {
        var categories = new Map();
        var roles = self.categoricalRoles;
        roles.forEach(function (role) {
            var categorySet = self.categorySetForAttrRole(role);
            if (categorySet) {
                categories.set(role, categorySet.valuesArray);
            }
        });
        return categories;
    }
}); })
    .views(function (self) { return ({
    getUnsortedCaseDataArray: function (caseArrayNumber) {
        var _a;
        return (((_a = self.filteredCases[caseArrayNumber]) === null || _a === void 0 ? void 0 : _a.caseIds) || []).map(function (id) {
            return { plotNum: caseArrayNumber, caseID: id };
        });
    }
}); })
    .views(function (self) { return ({
    // Note that we have to go through each of the filteredCases in order to return all the values
    getCaseDataArray: (0, mst_utils_1.cachedFnWithArgsFactory)({
        key: function (caseArrayNumber) { return String(caseArrayNumber); },
        calculate: function (caseArrayNumber) {
            var caseDataArray = self.getUnsortedCaseDataArray(caseArrayNumber), legendAttrID = self.attributeID('legend');
            if (legendAttrID) {
                if (self.attributeType("legend") === "numeric") {
                    caseDataArray.sort(function (cd1, cd2) {
                        var _a, _b, _c, _d;
                        var cd1Value = (_b = (_a = self.dataset) === null || _a === void 0 ? void 0 : _a.getNumeric(cd1.caseID, legendAttrID)) !== null && _b !== void 0 ? _b : NaN, cd2Value = (_d = (_c = self.dataset) === null || _c === void 0 ? void 0 : _c.getNumeric(cd2.caseID, legendAttrID)) !== null && _d !== void 0 ? _d : NaN;
                        return (0, data_utils_1.numericSortComparator)({ a: cd1Value, b: cd2Value, order: "desc" });
                    });
                }
                else {
                    var categories_1 = Array.from(self.categoryArrayForAttrRole('legend'));
                    caseDataArray.sort(function (cd1, cd2) {
                        var _a, _b, _c, _d;
                        var cd1Value = (_b = (_a = self.dataset) === null || _a === void 0 ? void 0 : _a.getStrValue(cd1.caseID, legendAttrID)) !== null && _b !== void 0 ? _b : '', cd2Value = (_d = (_c = self.dataset) === null || _c === void 0 ? void 0 : _c.getStrValue(cd2.caseID, legendAttrID)) !== null && _d !== void 0 ? _d : '';
                        return categories_1.indexOf(cd1Value) - categories_1.indexOf(cd2Value);
                    });
                }
            }
            return caseDataArray;
        },
        name: "getCaseDataArray"
    }),
    get joinedCaseDataArrays() {
        var joinedCaseData = [];
        self.filteredCases.forEach(function (aFilteredCases, index) {
            aFilteredCases.caseIds.forEach(function (id) { return joinedCaseData.push({ plotNum: index, caseID: id }); });
        });
        return joinedCaseData;
    },
    get lowColor() {
        var _a;
        var attrId = self.attributeID("legend");
        return (_a = self.metadata) === null || _a === void 0 ? void 0 : _a.getAttributeColorRange(attrId).low;
    },
    get highColor() {
        var _a;
        var attrId = self.attributeID("legend");
        return (_a = self.metadata) === null || _a === void 0 ? void 0 : _a.getAttributeColorRange(attrId).high;
    }
}); })
    .views(function (self) { return ({
    // observable hash of rendered case ids
    get caseDataHash() {
        return (0, js_utils_1.hashStringSets)(self.filteredCases.map(function (cases) { return cases.caseIds; }));
    },
    get choroplethColors() {
        var _a, _b;
        return (0, color_utils_1.getCholorplethColors)((_a = self.lowColor) !== null && _a !== void 0 ? _a : shared_case_metadata_constants_1.kDefaultLowAttributeColor, (_b = self.highColor) !== null && _b !== void 0 ? _b : shared_case_metadata_constants_1.kDefaultHighAttributeColor);
    }
}); })
    .views(function (self) { return ({
    get legendNumericColorScale() {
        var _a, _b;
        // TODO: Handle the displayOnlySelectedCases better. What we would like to do is
        // to basically ignore displayOnlySelectedCases when computing the legend bins.
        // This way the legend will not jump around when the user is selecting different
        // cases when in displayOnlySelectedCases mode.
        // There are several criteria besides displayOnlySelectedCases which impact which
        // cases are shown on the visualization:
        // - set aside cases in the dataset should be excluded
        // - cases filtered by the filter formula in the dataset should be excluded
        // - cases hidden in the visualization should be excluded
        // - cases filtered by the filter formula in the visualization should be excluded
        // - cases that are not plottable on at least one of the plots of the visualization
        //   should be excluded
        // All of these criteria are handled by numericValuesForAttrRole("legend") but it also
        // excludes unselected cases if displayOnlySelectedCases is enabled.
        // It would make sense for numericValuesForAttrRole to ignore the
        // displayOnlySelectedCases criteria. It is used here and also to compute the axis extents.
        // The axes should also not jump around when using displayOnlySelectedCases.
        // Implementing this is hard because of the last bullet. Handling the "not plottable"
        // cases is done by the FilteredCases system which is overridden by the
        // GraphDataConfigurationModel in order to handle graphs with multiple y axes. This
        // FilterCases system is also what implements displayOnlySelectedCases.
        // The best solution might be to separate the displayOnlySelectedCases from FilterCases,
        // perhaps by renaming it PlottableCases and then apply the displayOnlySelectedCases
        // criteria further up chain of filters.
        var values = (_a = self.numericValuesForAttrRole("legend")) !== null && _a !== void 0 ? _a : [];
        var legendAttrId = self.attributeID("legend");
        var binningType = (_b = self.metadata) === null || _b === void 0 ? void 0 : _b.getAttributeBinningType(legendAttrId);
        switch (binningType) {
            case "quantize": {
                var extents = (0, d3_1.extent)(values);
                if (extents[0] == null || extents[1] == null) {
                    return (0, d3_1.scaleQuantize)([], self.choroplethColors);
                }
                return (0, d3_1.scaleQuantize)(extents, self.choroplethColors);
            }
            case "quantile":
            default:
                return (0, d3_1.scaleQuantile)(values, self.choroplethColors);
        }
    },
}); })
    .views(function (self) { return ({
    getLegendColorForCategory: function (cat) {
        var _a;
        var categorySet = self.categorySetForAttrRole('legend');
        return (_a = categorySet === null || categorySet === void 0 ? void 0 : categorySet.colorForCategory(cat)) !== null && _a !== void 0 ? _a : color_utils_1.missingColor;
    },
    getLegendColorForNumericValue: function (value) {
        try {
            var scale = self.legendNumericColorScale;
            var scaleFunction = typeof scale === "function" ? scale : null;
            if (!scaleFunction) {
                console.error("Scale is not a function:", scale);
                return color_utils_1.missingColor;
            }
            var result = scaleFunction(value);
            if (!result) {
                console.error("Scale returned a falsy value for", value);
                return color_utils_1.missingColor;
            }
            return result;
        }
        catch (error) {
            console.error("Error in getLegendColorForNumericValue:", error);
            return color_utils_1.missingColor;
        }
    },
    getLegendColorForDateValue: function (value) {
        var dateValueArray = (0, date_utils_1.stringValuesToDateSeconds)([value]);
        return self.legendNumericColorScale(dateValueArray[0]);
    },
    getCasesForCategoryValues: function (primaryAttrRole, primaryValue, secondaryValue, primarySplitValue, secondarySplitValue, legendCat, extend) {
        if (extend === void 0) { extend = false; }
        var dataset = self.dataset, primaryAttrID = self.attributeID(primaryAttrRole), secondaryAttrRole = primaryAttrRole === "x" ? "y" : "x", extraPrimaryAttrRole = primaryAttrRole === "x" ? "topSplit" : "rightSplit", extraSecondaryAttrRole = primaryAttrRole === "x" ? "rightSplit" : "topSplit", secondaryAttrID = self.attributeID(secondaryAttrRole), extraPrimaryAttrID = self.attributeID(extraPrimaryAttrRole), extraSecondaryAttrID = self.attributeID(extraSecondaryAttrRole);
        return primaryAttrID
            ? self.getCaseDataArray(0).filter(function (aCaseData) {
                return (dataset === null || dataset === void 0 ? void 0 : dataset.getStrValue(aCaseData.caseID, primaryAttrID)) === primaryValue &&
                    (secondaryValue === data_display_types_1.kMain ||
                        (dataset === null || dataset === void 0 ? void 0 : dataset.getStrValue(aCaseData.caseID, secondaryAttrID)) === secondaryValue) &&
                    (primarySplitValue === data_display_types_1.kMain ||
                        (dataset === null || dataset === void 0 ? void 0 : dataset.getStrValue(aCaseData.caseID, extraPrimaryAttrID)) === primarySplitValue) &&
                    (secondarySplitValue === data_display_types_1.kMain ||
                        (dataset === null || dataset === void 0 ? void 0 : dataset.getStrValue(aCaseData.caseID, extraSecondaryAttrID)) === secondarySplitValue) &&
                    (!legendCat ||
                        (dataset === null || dataset === void 0 ? void 0 : dataset.getStrValue(aCaseData.caseID, self.attributeID("legend"))) === legendCat);
            }).map(function (aCaseData) { return aCaseData.caseID; })
            : [];
    },
    getCasesForLegendValue: function (aValue) {
        var dataset = self.dataset, legendID = self.attributeID('legend'), collectionGroup = dataset === null || dataset === void 0 ? void 0 : dataset.getCollectionForAttribute(legendID || '');
        var caseIDs = [];
        if (collectionGroup) {
            var parentCases = dataset === null || dataset === void 0 ? void 0 : dataset.getCasesForCollection(collectionGroup.id);
            parentCases === null || parentCases === void 0 ? void 0 : parentCases.forEach(function (aCase) {
                if ((dataset === null || dataset === void 0 ? void 0 : dataset.getStrValue(aCase.__id__, legendID || '')) === aValue) {
                    caseIDs === null || caseIDs === void 0 ? void 0 : caseIDs.push(aCase.__id__);
                }
            });
        }
        else {
            caseIDs = legendID ? self.getCaseDataArray(0).filter(function (aCaseData) {
                return (dataset === null || dataset === void 0 ? void 0 : dataset.getStrValue(aCaseData.caseID, legendID)) === aValue;
            }).map(function (aCaseData) { return aCaseData.caseID; })
                : [];
        }
        return caseIDs;
    },
    allCasesForCategoryAreSelected: (0, mst_utils_1.cachedFnWithArgsFactory)({
        key: function (cat) { return cat; },
        calculate: function (cat) {
            var _a;
            var dataset = self.dataset;
            var legendID = self.attributeID('legend');
            var selection = (_a = (legendID && self.getCaseDataArray(0).filter(function (aCaseData) {
                return (dataset === null || dataset === void 0 ? void 0 : dataset.getStrValue(aCaseData.caseID, legendID)) === cat;
            }).map(function (aCaseData) { return aCaseData.caseID; }))) !== null && _a !== void 0 ? _a : [];
            return selection.length > 0 && selection.every(function (anID) { return dataset === null || dataset === void 0 ? void 0 : dataset.isCaseSelected(anID); });
        },
        name: "allCasesForCategoryAreSelected"
    }),
    getCasesInLegendRange: function (min, max) {
        var dataset = self.dataset;
        var legendID = self.attributeID('legend');
        return legendID
            ? self.getCaseDataArray(0).filter(function (aCaseData) {
                var value = (0, data_display_value_utils_1.dataDisplayGetNumericValue)(dataset, aCaseData.caseID, legendID);
                return value !== undefined && value >= min && value < max;
            }).map(function (aCaseData) { return aCaseData.caseID; })
            : [];
    }
}); })
    .views(function (self) { return ({
    getCasesForLegendBin: function (bin) {
        var scale = self.legendNumericColorScale;
        var thresholds = (0, choropleth_legend_1.getScaleThresholds)(scale);
        var min = bin === 0 ? -Infinity : thresholds[bin - 1];
        var max = bin === thresholds.length ? Infinity : thresholds[bin];
        return self.getCasesInLegendRange(min, max);
    }
}); })
    .views(function (self) { return ({
    casesInBinAreSelected: function (quantile) {
        var selection = self.getCasesForLegendBin(quantile);
        return !!(selection.length > 0 && (selection === null || selection === void 0 ? void 0 : selection.every(function (anID) { var _a; return (_a = self.dataset) === null || _a === void 0 ? void 0 : _a.isCaseSelected(anID); })));
    }
}); })
    .views(function (self) { return ({
    placeCanHaveZeroExtent: function (place) {
        return ['rightNumeric', 'legend', 'top', 'rightCat'].includes(place) &&
            !self.attributeID(data_display_types_1.graphPlaceToAttrRole[place]);
    },
    // GraphDataConfigurationModel overrides this. Here we only have to worry about the 'legend' role.
    placeCanAcceptAttributeIDDrop: function (place, dataSet, idToDrop) {
        if (idToDrop) {
            var desc = self.attributeDescriptionForRole('legend');
            return !desc || desc.attributeID !== idToDrop;
        }
        return false;
    },
    /**
     * This is a domain which can be monitored by reactions without having to
     * request the color for every case to see if the colors have changed.
     * For numeric and date it is an actual d3 color scale.
     * For categorical it is a map of categories to colors
     * The color type is not handled yet.
     */
    get legendColorDomain() {
        var legendType = self.attributeType('legend');
        switch (legendType) {
            case "categorical": {
                var categorySet = self.categorySetForAttrRole('legend');
                return categorySet === null || categorySet === void 0 ? void 0 : categorySet.colorMap;
            }
            case "numeric":
            case "date":
                return self.legendNumericColorScale;
            case "color":
                // TODO: we need to be watching for any changes to the legend attribute values
                return 0;
            default:
                return 0;
        }
    },
    getLegendColorForCase: function (id) {
        var _a, _b;
        var collectionOfLegendIsMoreChildmost = function () {
            var _a, _b, _c, _d, _e, _f;
            var legendCollectionID = (_b = (_a = self.dataset) === null || _a === void 0 ? void 0 : _a.getCollectionForAttribute(legendID)) === null || _b === void 0 ? void 0 : _b.id, legendCollectionIndex = (_d = (_c = self.dataset) === null || _c === void 0 ? void 0 : _c.getCollectionIndex(legendCollectionID)) !== null && _d !== void 0 ? _d : 0, childmostCollectionID = (0, data_set_utils_1.idOfChildmostCollectionForAttributes)(self.axisAttributeIDs, self.dataset), childmostCollectionIndex = (_f = (_e = self.dataset) === null || _e === void 0 ? void 0 : _e.getCollectionIndex(childmostCollectionID)) !== null && _f !== void 0 ? _f : 0;
            return legendCollectionIndex > childmostCollectionIndex;
        };
        var legendID = self.attributeID('legend');
        // todo: When user deletes we are not currently deleting the legend attribute ID. But we should.
        var legendAttribute = (_a = self.dataset) === null || _a === void 0 ? void 0 : _a.getAttribute(legendID);
        if (!id || !legendID || !legendAttribute) {
            return '';
        }
        var legendType = self.attributeType('legend');
        if (collectionOfLegendIsMoreChildmost()) {
            return color_utils_1.missingColor;
        }
        var legendValue = (_b = self.dataset) === null || _b === void 0 ? void 0 : _b.getStrValue(id, legendID);
        if (!legendValue) {
            return color_utils_1.missingColor;
        }
        switch (legendType) {
            case 'categorical':
                return self.getLegendColorForCategory(legendValue);
            case 'numeric':
                return self.getLegendColorForNumericValue(Number(legendValue));
            case 'date':
                return self.getLegendColorForDateValue(legendValue);
            case 'color':
                return (0, color_utils_1.parseColor)(legendValue, { colorNames: true }) ? legendValue : color_utils_1.missingColor;
            default:
                return '';
        }
    }
}); })
    .actions(function (self) { return ({
    clearCasesCache: function () {
        self.valuesForAttrRole.invalidateAll();
        self.numericValuesForAttrRole.invalidateAll();
        self.categoryArrayForAttrRole.invalidateAll();
        self.allCasesForCategoryAreSelected.invalidateAll();
        self.getCaseDataArray.invalidateAll();
        // increment observable change count
        ++self.casesChangeCount;
    }
}); })
    .actions(function (self) { return ({
    /**
     * This is called when the user swaps categories in the legend, but not when the user swaps categories
     * by dragging categories on an axis.
     * @param role
     */
    storeAllCurrentColorsForAttrRole: function (role) {
        var categorySet = self.categorySetForAttrRole(role);
        if (categorySet) {
            categorySet.storeAllCurrentColors();
        }
    },
    // This will only swap the categories if they are neighbors.
    // If the categories are not next to each other the behavior is complex,
    // so it is best to read the code to understand what will happen.
    swapCategoriesForAttrRole: function (role, catIndex1, catIndex2) {
        var categoryArray = self.categoryArrayForAttrRole(role), numCategories = categoryArray.length, categorySet = self.categorySetForAttrRole(role);
        if (catIndex2 < catIndex1) {
            var temp = catIndex1;
            catIndex1 = catIndex2;
            catIndex2 = temp;
        }
        if (categorySet && numCategories > catIndex1 && numCategories > catIndex2) {
            var cat1 = categoryArray[catIndex1], beforeCat = catIndex2 < numCategories - 1 ? categoryArray[catIndex2 + 1] : undefined;
            categorySet.move(cat1, beforeCat);
        }
    },
    handleSetCaseValues: function (actionCall, cases) {
        var _a;
        if (!(0, data_set_actions_1.isSetCaseValuesAction)(actionCall))
            return;
        var affectedCases = actionCall.args[0];
        // this is called by the FilteredCases object with additional information about
        // whether the value changes result in adding/removing any cases from the filtered set
        // a single call to setCaseValues can result in up to three calls to the handlers
        if (cases.added.length) {
            var newCases_1 = (_a = self.dataset) === null || _a === void 0 ? void 0 : _a.getItems(cases.added);
            self.handlers.forEach(function (handler) { return handler({ name: "addCases", args: [newCases_1] }); });
        }
        if (cases.removed.length) {
            self.handlers.forEach(function (handler) { return handler({ name: "removeCases", args: [cases.removed] }); });
        }
        if (cases.changed.length) {
            var idSet_1 = new Set(cases.changed);
            var changedCases_1 = affectedCases.filter(function (aCase) { return idSet_1.has(aCase.__id__); });
            self.handlers.forEach(function (handler) { return handler({ name: "setCaseValues", args: [changedCases_1] }); });
            ++self.casesChangeCount;
        }
    },
    _updateFilteredCasesCollectionID: function () {
        var childmostCollectionID = (0, data_set_utils_1.idOfChildmostCollectionForAttributes)(self.axisAttributeIDs, self.dataset);
        self.filteredCases.forEach(function (aFilteredCases) {
            aFilteredCases.setCollectionID(childmostCollectionID);
        });
    },
    _invalidateCases: function () {
        self.filteredCases.forEach(function (aFilteredCases) {
            aFilteredCases.invalidateCases();
        });
        self.clearCasesCache();
    },
    _addNewFilteredCases: function () {
        if (self.dataset) {
            this._updateFilteredCasesCollectionID();
            self.filteredCases.push(new filtered_cases_1.FilteredCases({
                source: self.dataset,
                casesArrayNumber: self.filteredCases.length,
                filter: self.filterCase,
                collectionID: (0, data_set_utils_1.idOfChildmostCollectionForAttributes)(self.attributes, self.dataset),
                onSetCaseValues: this.handleSetCaseValues
            }));
            self.setPointsNeedUpdating(true);
        }
    },
    _clearFilteredCases: function (dataset) {
        self.filteredCases.forEach(function (aFilteredCases) {
            aFilteredCases.destroy();
        });
        self.filteredCases.clear();
        if (dataset) {
            self.filteredCases[0] = new filtered_cases_1.FilteredCases({
                source: dataset,
                filter: self.filterCase,
                collectionID: (0, data_set_utils_1.idOfChildmostCollectionForAttributes)(self.attributes, dataset),
                onSetCaseValues: this.handleSetCaseValues
            });
        }
    },
    _setAttributeType: function (type, plotNumber) {
        var _a;
        if (plotNumber === void 0) { plotNumber = 0; }
        (_a = self.filteredCases) === null || _a === void 0 ? void 0 : _a.forEach(function (aFilteredCases) {
            aFilteredCases.invalidateCases();
        });
    },
    handleDataSetAction: function (actionCall) {
        var cacheClearingActions = ["setCaseValues", "addCases", "removeCases", "removeAttribute"];
        if (cacheClearingActions.includes(actionCall.name)) {
            self.clearCasesCache();
        }
        // forward all actions from dataset except "setCaseValues" which requires intervention
        if (actionCall.name === "setCaseValues")
            return;
        if (actionCall.name === "invalidateCollectionGroups") {
            this._updateFilteredCasesCollectionID();
            this._invalidateCases();
        }
        self.handlers.forEach(function (handler) { return handler(actionCall); });
    },
}); })
    .actions(function (self) { return ({
    setLegendColorForCategory: function (cat, color) {
        var categorySet = self.categorySetForAttrRole('legend');
        categorySet === null || categorySet === void 0 ? void 0 : categorySet.setColorForCategory(cat, color);
    },
    setNumberOfCategoriesLimitForRole: function (role, limit) {
        if (limit !== undefined && limit <= 0) {
            limit = undefined;
        }
        self.numberOfCategoriesLimitByRole.set(role, limit);
        self.categoryArrayForAttrRole.invalidate(role);
    },
}); })
    .actions(function (self) { return ({
    clearFilterFormula: function () {
        self.filterFormula = undefined;
        self.filteredOutCaseIds.clear();
        self.filterFormulaError = "";
        self._invalidateCases();
    }
}); })
    .actions(function (self) { return ({
    setFilterFormula: function (display) {
        if (display) {
            if (!self.filterFormula) {
                self.filterFormula = formula_1.Formula.create({ display: display });
            }
            else {
                self.filterFormula.setDisplayExpression(display);
            }
        }
        else {
            self.clearFilterFormula();
        }
    },
    updateFilterFormulaResults: function (filterFormulaResults, _a) {
        var _b = _a.replaceAll, replaceAll = _b === void 0 ? false : _b;
        if (replaceAll) {
            self.filteredOutCaseIds.clear();
        }
        filterFormulaResults.forEach(function (_a) {
            var itemId = _a.itemId, result = _a.result;
            if (result === false) {
                self.filteredOutCaseIds.add(itemId);
            }
            else {
                self.filteredOutCaseIds.delete(itemId);
            }
        });
        self._invalidateCases();
    },
    setFilterFormulaError: function (error) {
        self.filterFormulaError = error;
    }
}); })
    .actions(function (self) { return ({
    handleDataSetChange: function (data) {
        var _a;
        (_a = self.actionHandlerDisposer) === null || _a === void 0 ? void 0 : _a.call(self);
        self.actionHandlerDisposer = undefined;
        self._clearFilteredCases(data);
    }
}); })
    .actions(function (self) { return ({
    afterCreate: function () {
        // respond to change of dataset
        (0, mobx_state_tree_1.addDisposer)(self, (0, mobx_1.reaction)(function () { return self.dataset; }, function (data) { return self.handleDataSetChange(data); }, { name: "DataConfigurationModel.afterCreate.reaction [dataset]", fireImmediately: true }));
        (0, mobx_state_tree_1.addDisposer)(self, (0, mobx_1.reaction)(function () { return self.allCategoriesForRoles; }, function () { return self.clearCasesCache(); }, {
            name: "DataConfigurationModel.afterCreate.reaction [allCategoriesForRoles]",
            equals: mobx_1.comparer.structural
        }));
        (0, mobx_state_tree_1.addDisposer)(self, (0, mobx_1.reaction)(function () {
            var legendCategorySet = self.categorySetForAttrRole("legend");
            return legendCategorySet === null || legendCategorySet === void 0 ? void 0 : legendCategorySet.valuesArray;
        }, function () { return self.clearCasesCache(); }, {
            name: "DataConfigurationModel.afterCreate.reaction [allCategoriesForRoles]",
            equals: mobx_1.comparer.structural
        }));
        // respond to change of legend attribute
        (0, mobx_state_tree_1.addDisposer)(self, (0, mobx_1.reaction)(function () { return JSON.stringify(self.attributeDescriptionForRole("legend")); }, function () {
            self.clearCasesCache();
        }, { name: "DataConfigurationModel.afterCreate.reaction [legend attribute]" }));
        // Invalidate cache when selection changes.
        (0, mobx_state_tree_1.addDisposer)(self, (0, mobx_1.reaction)(function () { var _a; return (_a = self.dataset) === null || _a === void 0 ? void 0 : _a.selection.values(); }, function () {
            if (self.displayOnlySelectedCases) {
                self.clearCasesCache();
            }
            else {
                self.allCasesForCategoryAreSelected.invalidateAll();
            }
        }, {
            name: "DataConfigurationModel.afterCreate.reaction [allCasesForCategoryAreSelected invalidate cache]",
            equals: mobx_1.comparer.structural
        }));
        // invalidate caches when set of visible cases changes
        (0, mobx_state_tree_1.addDisposer)(self, (0, mobx_1.reaction)(function () { return self.caseDataHash; }, function () { return self._invalidateCases(); }, { name: "DataConfigurationModel.afterCreate.reaction [add/remove/hide cases]" }));
        // invalidate filtered cases when childmost collection changes
        (0, mobx_state_tree_1.addDisposer)(self, (0, mobx_1.reaction)(function () { return self.childmostCollectionIDForAxisAttributes; }, function () { return self._clearFilteredCases(self.dataset); }, { name: "DataConfigurationModel.afterCreate.reaction [childmost collection]" }));
    },
    setDataset: function (dataset, metadata) {
        self.dataset = dataset;
        self.metadata = metadata;
    },
    clearAttributes: function () {
        self._attributeDescriptions.clear();
    },
    setAttribute: function (role, desc) {
        self._setAttributeDescription(role, desc);
        self.setPointsNeedUpdating(true);
    },
    setAttributeType: function (role, type, plotNumber) {
        var _a;
        if (plotNumber === void 0) { plotNumber = 0; }
        (_a = self._attributeDescriptions.get(role)) === null || _a === void 0 ? void 0 : _a.setType(type);
        self._setAttributeType(type, plotNumber);
    },
    addNewHiddenCases: function (hiddenCases) {
        var _a;
        (_a = self.hiddenCases).push.apply(_a, hiddenCases);
    },
    clearHiddenCases: function () {
        self.hiddenCases.replace([]);
    },
    setHiddenCases: function (hiddenCases) {
        self.hiddenCases.replace(hiddenCases);
    },
    setDisplayOnlySelectedCases: function (displayOnlySelectedCases) {
        self.displayOnlySelectedCases = displayOnlySelectedCases || undefined;
        self.clearCasesCache();
    }
}); })
    .actions(function (self) { return ({
    removeAttributeFromRole: function (role, attrID) {
        self.setAttribute(role);
    },
}); })
    .views(function (self) { return ({
    onAction: function (handler) {
        var id = (0, js_utils_1.uniqueId)();
        self.handlers.set(id, handler);
        return function () {
            self.handlers.delete(id);
        };
    }
}); })
    // performs the specified action so that response actions are included and undo/redo strings assigned
    .actions(apply_model_change_1.applyModelChange);
function isFilterFormulaDataConfiguration(dataConfig) {
    return !!(dataConfig === null || dataConfig === void 0 ? void 0 : dataConfig.hasFilterFormula);
}
