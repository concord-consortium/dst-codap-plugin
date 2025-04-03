"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.CollectionModel = exports.defaultItemData = exports.CollectionLabels = void 0;
exports.isCollectionModel = isCollectionModel;
exports.syncCollectionLinks = syncCollectionLinks;
var mobx_1 = require("mobx");
var mobx_state_tree_1 = require("mobx-state-tree");
var codap_utils_1 = require("../../utilities/codap-utils");
var js_utils_1 = require("../../utilities/js-utils");
var attribute_1 = require("./attribute");
var data_set_types_1 = require("./data-set-types");
var v2_model_1 = require("./v2-model");
exports.CollectionLabels = mobx_state_tree_1.types.model("CollectionLabels", {
    singleCase: "",
    pluralCase: "",
    singleCaseWithArticle: "",
    setOfCases: "",
    setOfCasesWithArticle: ""
});
// used for initialization and tests
exports.defaultItemData = {
    itemIds: function () { return []; },
    isHidden: function () { return false; },
    getValue: function () { return ""; },
    addItemInfo: function () { return null; },
    invalidate: function () { return null; }
};
exports.CollectionModel = v2_model_1.V2Model
    .named("Collection")
    .props({
    id: (0, codap_utils_1.typeV3Id)(codap_utils_1.kCollectionIdPrefix),
    labels: mobx_state_tree_1.types.maybe(exports.CollectionLabels),
    // attributes in left-to-right order
    attributes: mobx_state_tree_1.types.array(mobx_state_tree_1.types.safeReference(attribute_1.Attribute)),
    // array of [group key (stringified attribute values), case id] tuples
    // serialized so that case ids are persistent
    _groupKeyCaseIds: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.frozen())
})
    .volatile(function (self) { return ({
    parent: undefined,
    child: undefined,
    // map from group key (stringified attribute values) => case id
    groupKeyCaseIds: new Map(),
    itemData: exports.defaultItemData,
    // case ids in case table/render order
    caseIds: [],
    // map from case id to case index
    caseIdToIndexMap: new Map(),
    // map from case id to group key (stringified attribute values)
    caseIdToGroupKeyMap: new Map(),
    // map from group key (stringified attribute values) to CaseInfo
    caseGroupMap: new Map(),
    // case ids in case table/render order
    prevCaseIds: undefined,
    // map from case id to group key (stringified attribute values)
    prevCaseIdToGroupKeyMap: undefined,
    // map from group key (stringified attribute values) to CaseInfo
    prevCaseGroupMap: undefined
}); })
    .actions(function (self) { return ({
    setParent: function (parent) {
        self.parent = parent;
    },
    setChild: function (child) {
        self.child = child;
    },
    setItemData: function (itemData) {
        self.itemData = itemData;
    }
}); })
    .views(function (self) { return ({
    getAttribute: function (attrId) {
        return self.attributes.find(function (attribute) { return (attribute === null || attribute === void 0 ? void 0 : attribute.id) === attrId; });
    },
    getAttributeIndex: function (attrId) {
        return self.attributes.findIndex(function (attribute) { return (attribute === null || attribute === void 0 ? void 0 : attribute.id) === attrId; });
    },
    getAttributeByName: function (name) {
        return self.attributes.find(function (attribute) { return (attribute === null || attribute === void 0 ? void 0 : attribute.name) === name; });
    },
    get attributesArray() {
        return Array.from(self.attributes).filter(function (attr) { return !!attr; });
    },
    // non-formula attributes
    get dataAttributesArray() {
        return Array.from(self.attributes).filter(function (attr) { return attr && !attr.hasFormula; });
    },
    // sorted non-formula attributes
    get sortedDataAttributes() {
        return this.dataAttributesArray.sort(function (a, b) { return a.id.localeCompare(b.id); });
    },
    // attributes of all parent collections
    get allParentAttrs() {
        var attrs = [];
        function addParentAttrs(collection) {
            if (collection.parent) {
                addParentAttrs(collection.parent);
            }
            collection.attributes.forEach(function (attr) {
                attr && attrs.push(attr);
            });
        }
        if (self.parent) {
            addParentAttrs(self.parent);
        }
        return attrs;
    },
    // non-formula attributes of all parent collections
    get allParentDataAttrs() {
        return this.allParentAttrs.filter(function (attr) { return !attr.hasFormula; });
    },
    get isTopLevel() {
        return !self.parent;
    }
}); })
    .views(function (self) { return ({
    get allAttributes() {
        return __spreadArray(__spreadArray([], self.allParentAttrs, true), self.attributesArray, true);
    },
    // all non-formula
    get allDataAttributes() {
        // sort the attributes by id so that original attribute order doesn't affect the result
        return __spreadArray(__spreadArray([], self.allParentDataAttrs, true), self.dataAttributesArray, true).sort(function (a, b) { return a.id.localeCompare(b.id); });
    },
    // sorted non-formula attributes of parent collections
    get sortedParentDataAttrs() {
        return self.allParentDataAttrs.sort(function (a, b) { return a.id.localeCompare(b.id); });
    }
}); })
    .views(function (self) { return ({
    groupKey: function (itemId) {
        // only parent collections group cases; child collections "group" by itemId
        if (!self.child)
            return itemId;
        var allValues = self.allDataAttributes.map(function (attr) { return self.itemData.getValue(itemId, attr.id); });
        return JSON.stringify(allValues);
    },
    parentGroupKey: function (itemId) {
        if (!self.parent)
            return;
        var allValues = self.sortedParentDataAttrs.map(function (attr) { return self.itemData.getValue(itemId, attr.id); });
        return JSON.stringify(allValues);
    },
    groupKeyCaseId: function (groupKey) {
        if (!groupKey)
            return undefined;
        var caseId = self.groupKeyCaseIds.get(groupKey);
        if (!caseId) {
            caseId = (0, codap_utils_1.v3Id)(codap_utils_1.kCaseIdPrefix);
            self.groupKeyCaseIds.set(groupKey, caseId);
        }
        return caseId;
    }
}); })
    .views(function (self) { return ({
    getChildItemsToken: function (caseId) {
        var groupKey = self.caseIdToGroupKeyMap.get(caseId);
        var caseGroup = groupKey ? self.caseGroupMap.get(groupKey) : undefined;
        var childItemIds = (caseGroup === null || caseGroup === void 0 ? void 0 : caseGroup.childItemIds.length) ? caseGroup.childItemIds : undefined;
        return childItemIds === null || childItemIds === void 0 ? void 0 : childItemIds.sort().join();
    },
    getPrevChildItemsToken: function (caseId) {
        var _a, _b;
        var groupKey = (_a = self.prevCaseIdToGroupKeyMap) === null || _a === void 0 ? void 0 : _a.get(caseId);
        var caseGroup = groupKey ? (_b = self.prevCaseGroupMap) === null || _b === void 0 ? void 0 : _b.get(groupKey) : undefined;
        var childItemIds = (caseGroup === null || caseGroup === void 0 ? void 0 : caseGroup.childItemIds.length) ? caseGroup.childItemIds : undefined;
        return childItemIds === null || childItemIds === void 0 ? void 0 : childItemIds.sort().join();
    }
}); })
    .actions(function (self) { return ({
    clearCases: function () {
        if (!self.prevCaseIds)
            self.prevCaseIds = self.caseIds;
        self.caseIds = [];
        self.caseIdToIndexMap.clear();
        if (!self.prevCaseIdToGroupKeyMap)
            self.prevCaseIdToGroupKeyMap = self.caseIdToGroupKeyMap;
        self.caseIdToGroupKeyMap = new Map();
        if (!self.prevCaseGroupMap)
            self.prevCaseGroupMap = self.caseGroupMap;
        self.caseGroupMap = new Map();
    },
    clearPrevCases: function () {
        self.prevCaseIds = undefined;
        self.prevCaseIdToGroupKeyMap = undefined;
        self.prevCaseGroupMap = undefined;
    }
}); })
    .views(function (self) { return ({
    // returns a map from newly assigned case id to previously used case id
    getRemappedCaseIds: function (newCaseIds) {
        // See if any case ids should be remapped. This occurs when the grouping values of a parent
        // case change in unison, in which case we preserve the original case id rather than assigning
        // a new one. Because the grouping values are used to generate the groupKey, and groupKeys are
        // mapped to case ids, normally changing grouping values results in generation of a new id.
        // To detect this, we identify case ids that were in use the last time we grouped cases as
        // well as newly generated case ids corresponding to new groupKeys. If there are any recently
        // unused case ids that correspond to the same set of items as any of the newly generated case
        // ids, then we replace the new case id with the original case id in our internal structures.
        // We have to do this in a second pass because we don't know the full set of child item ids
        // associated with a particular case id or groupKey until the completion of the first pass.
        // This assumes that from one grouping pass to the next, either items were added/removed
        // (in which case sets of child item ids may have changed but case ids should be persistent)
        // OR item values were changed (in which case case ids may have changed but sets of child item
        // ids will not have changed). If both sets of changes occur in one pass then the remapping
        // algorithm won't recognize the new cases as appropriate to inherit the previous case ids.
        var remappedCaseIds = new Map(); // new case id => original case id
        if (self.prevCaseIds) {
            // identify recently released case ids no longer in use
            var unusedCaseIds = self.prevCaseIds.filter(function (caseId) { return !self.caseIdToGroupKeyMap.get(caseId); });
            if (unusedCaseIds.length && newCaseIds.length) {
                // determine the set of child item ids corresponding to each unused case id
                var unusedChildItemTokens_1 = new Map();
                unusedCaseIds.forEach(function (caseId) {
                    var childItemToken = self.getPrevChildItemsToken(caseId);
                    if (childItemToken) {
                        unusedChildItemTokens_1.set(childItemToken, caseId);
                    }
                });
                // see if any newly assigned case ids correspond to sets of items previously
                // associated with one of the recently released case ids no longer in use
                newCaseIds.forEach(function (newCaseId) {
                    var childItemToken = self.getChildItemsToken(newCaseId);
                    var unusedCaseIdForToken = childItemToken && unusedChildItemTokens_1.get(childItemToken);
                    if (unusedCaseIdForToken) {
                        // found an unused case id corresponding to the same child items as a new case id
                        remappedCaseIds.set(newCaseId, unusedCaseIdForToken);
                    }
                });
            }
        }
        return remappedCaseIds;
    }
}); })
    .views(function (self) { return ({
    updateCaseGroups: function () {
        self.clearCases();
        var newCaseIds = [];
        // key is child caseId
        var parentChildIdMap = new Map();
        var itemInfo = [];
        self.itemData.itemIds().forEach(function (itemId, itemIndex) {
            var _a, _b;
            var _c;
            var isItemHidden = self.itemData.isHidden(itemId);
            var groupKey = self.groupKey(itemId);
            var hadCaseIdForGroupKey = !!self.groupKeyCaseIds.get(groupKey);
            var caseId = self.groupKeyCaseId(groupKey);
            if (caseId && !hadCaseIdForGroupKey)
                newCaseIds.push(caseId);
            if (groupKey && caseId) {
                var caseGroup = self.caseGroupMap.get(groupKey);
                if (!caseGroup) {
                    // cases with only hidden items aren't in caseIds and don't get indices
                    var newCaseIndex = isItemHidden ? -1 : self.caseIds.length;
                    !isItemHidden && self.caseIds.push(caseId);
                    self.caseIdToIndexMap.set(caseId, newCaseIndex);
                    self.caseIdToGroupKeyMap.set(caseId, groupKey);
                    var parentGroupKey = self.parentGroupKey(itemId);
                    var parentCaseId = (_c = self.parent) === null || _c === void 0 ? void 0 : _c.groupKeyCaseId(parentGroupKey);
                    var parent_1 = parentCaseId ? (_a = {}, _a[data_set_types_1.symParent] = parentCaseId, _a) : {};
                    // stash parent/child pairs so they can be remapped if necessary
                    parentCaseId && parentChildIdMap.set(caseId, { parentCaseId: parentCaseId, isHidden: isItemHidden });
                    caseGroup = {
                        collectionId: self.id,
                        groupedCase: __assign(__assign({ __id__: caseId }, parent_1), (_b = {}, _b[data_set_types_1.symIndex] = newCaseIndex, _b)),
                        childItemIds: isItemHidden ? [] : [itemId],
                        hiddenChildItemIds: isItemHidden ? [itemId] : [],
                        groupKey: groupKey,
                        // case is hidden if all of its items are hidden
                        isHidden: isItemHidden
                    };
                    self.caseGroupMap.set(groupKey, caseGroup);
                }
                // case group already exists
                else {
                    // If case is hidden, then this is its first visible item. Need to make the case visible.
                    if (!isItemHidden && caseGroup.isHidden) {
                        var newCaseIndex = self.caseIds.length;
                        var parentChildInfo = parentChildIdMap.get(caseId);
                        self.caseIds.push(caseId);
                        self.caseIdToIndexMap.set(caseId, newCaseIndex);
                        parentChildInfo && (parentChildInfo.isHidden = false);
                        caseGroup.groupedCase[data_set_types_1.symIndex] = newCaseIndex;
                        caseGroup.isHidden = false;
                    }
                    if (isItemHidden) {
                        caseGroup.hiddenChildItemIds.push(itemId);
                    }
                    else {
                        caseGroup.childItemIds.push(itemId);
                    }
                }
                // item info is stored for all items
                itemInfo.push({ itemId: itemId, caseId: caseId });
            }
        });
        // Identify any new case ids that should be replaced with a prior case id
        var remappedCaseIds = self.getRemappedCaseIds(newCaseIds);
        // add item info, remapping case ids where appropriate
        itemInfo.forEach(function (_a) {
            var _b;
            var itemId = _a.itemId, caseId = _a.caseId;
            var _caseId = (_b = remappedCaseIds.get(caseId)) !== null && _b !== void 0 ? _b : caseId;
            self.itemData.addItemInfo(itemId, _caseId);
        });
        // add child case ids to parent cases, remapping child case ids where appropriate
        parentChildIdMap.forEach(function (_a, _childCaseId) {
            var _b, _c;
            var parentCaseId = _a.parentCaseId, isHidden = _a.isHidden;
            if (!isHidden) {
                var childCaseId = (_b = remappedCaseIds.get(_childCaseId)) !== null && _b !== void 0 ? _b : _childCaseId;
                (_c = self.parent) === null || _c === void 0 ? void 0 : _c.addChildCase(parentCaseId, childCaseId);
            }
        });
        // remap case ids in our internal structures
        if (remappedCaseIds.size) {
            self.caseIds.forEach(function (caseId, i) {
                var remappedCaseId = remappedCaseIds.get(caseId);
                if (remappedCaseId) {
                    self.caseIds[i] = remappedCaseId;
                }
            });
        }
        Array.from(remappedCaseIds.entries()).forEach(function (_a) {
            var _b;
            var newCaseId = _a[0], origCaseId = _a[1];
            // update index map
            var caseIndex = self.caseIdToIndexMap.get(newCaseId);
            if (caseIndex != null) {
                self.caseIdToIndexMap.delete(newCaseId);
                self.caseIdToIndexMap.set(origCaseId, caseIndex);
            }
            // update group key-case id relationships
            var groupKey = self.caseIdToGroupKeyMap.get(newCaseId);
            if (groupKey != null) {
                // update group key to case id map
                var origGroupKey = (_b = self.prevCaseIdToGroupKeyMap) === null || _b === void 0 ? void 0 : _b.get(origCaseId);
                origGroupKey && self.groupKeyCaseIds.delete(origGroupKey);
                self.groupKeyCaseIds.set(groupKey, origCaseId);
                // update case id to group key map
                self.caseIdToGroupKeyMap.delete(newCaseId);
                self.caseIdToGroupKeyMap.set(origCaseId, groupKey);
                // update case group map entry
                var caseGroup = self.caseGroupMap.get(groupKey);
                if (caseGroup) {
                    caseGroup.groupedCase.__id__ = origCaseId;
                }
            }
        });
        self.clearPrevCases();
    }
}); })
    .views(function (self) { return ({
    hasCase: function (caseId) {
        return self.caseIdToIndexMap.has(caseId);
    },
    getCaseIndex: function (caseId) {
        return self.caseIdToIndexMap.get(caseId);
    },
    getCaseGroup: function (caseId) {
        var groupKey = self.caseIdToGroupKeyMap.get(caseId);
        return groupKey ? self.caseGroupMap.get(groupKey) : undefined;
    },
    addChildCase: function (parentCaseId, childCaseId) {
        var groupKey = self.caseIdToGroupKeyMap.get(parentCaseId);
        var caseGroup = groupKey && self.caseGroupMap.get(groupKey);
        if (caseGroup) {
            if (!caseGroup.childCaseIds) {
                caseGroup.childCaseIds = [childCaseId];
            }
            else {
                caseGroup.childCaseIds.push(childCaseId);
            }
        }
        else {
            console.warn("CollectionModel.addChildCase -- missing parent case:", parentCaseId);
        }
    },
}); })
    .extend(function (self) {
    var _caseGroups = mobx_1.observable.box([]);
    var _cases = mobx_1.observable.box([]);
    var _caseIdsHash = mobx_1.observable.box(0);
    var _caseIdsOrderedHash = mobx_1.observable.box(0);
    return {
        views: {
            get caseGroups() {
                return _caseGroups.get();
            },
            get cases() {
                return _cases.get();
            },
            get caseIdsHash() {
                return _caseIdsHash.get();
            },
            get caseIdsOrderedHash() {
                return _caseIdsOrderedHash.get();
            },
            completeCaseGroups: function (parentCaseGroups) {
                if (parentCaseGroups) {
                    self.caseIds.splice(0, self.caseIds.length);
                    // sort cases by parent cases
                    parentCaseGroups.forEach(function (parentGroup) {
                        var _a;
                        var _b;
                        var childCaseIds = (_b = parentGroup.childCaseIds) !== null && _b !== void 0 ? _b : [];
                        // update indices
                        childCaseIds.forEach(function (childCaseId, index) {
                            var caseGroup = self.getCaseGroup(childCaseId);
                            caseGroup && (caseGroup.groupedCase[data_set_types_1.symIndex] = index);
                        });
                        // append case ids in grouped order
                        (_a = self.caseIds).push.apply(_a, childCaseIds);
                    });
                }
                var caseGroups = self.caseIds
                    .map(function (caseId) { return self.getCaseGroup(caseId); })
                    .filter(function (group) { return !!group; });
                var cases = self.caseIds
                    .map(function (caseId) { var _a; return (_a = self.getCaseGroup(caseId)) === null || _a === void 0 ? void 0 : _a.groupedCase; })
                    .filter(function (groupedCase) { return !!groupedCase; });
                (0, mobx_1.runInAction)(function () {
                    _caseGroups.set(caseGroups);
                    _cases.set(cases);
                    _caseIdsHash.set((0, js_utils_1.hashStringSet)(self.caseIds));
                    _caseIdsOrderedHash.set((0, js_utils_1.hashOrderedStringSet)(self.caseIds));
                });
            }
        }
    };
})
    .views(function (self) { return ({
    findParentCaseGroup: function (childCaseId) {
        //consider building a child -> parent case id map if performance is an issue
        return self.caseGroups.find(function (group) { var _a; return (_a = group.childCaseIds) === null || _a === void 0 ? void 0 : _a.includes(childCaseId); });
    }
}); })
    .actions(function (self) { return ({
    setSingleCase: function (singleCase) {
        if (self.labels) {
            self.labels.singleCase = singleCase;
        }
        else {
            self.labels = exports.CollectionLabels.create({ singleCase: singleCase });
        }
    },
    setPluralCase: function (pluralCase) {
        if (self.labels) {
            self.labels.pluralCase = pluralCase;
        }
        else {
            self.labels = exports.CollectionLabels.create({ pluralCase: pluralCase });
        }
    },
    setSingleCaseWithArticle: function (singleCaseWithArticle) {
        if (self.labels) {
            self.labels.singleCaseWithArticle = singleCaseWithArticle;
        }
        else {
            self.labels = exports.CollectionLabels.create({ singleCaseWithArticle: singleCaseWithArticle });
        }
    },
    setSetOfCases: function (setOfCases) {
        if (self.labels) {
            self.labels.setOfCases = setOfCases;
        }
        else {
            self.labels = exports.CollectionLabels.create({ setOfCases: setOfCases });
        }
    },
    setSetOfCasesWithArticle: function (setOfCasesWithArticle) {
        if (self.labels) {
            self.labels.setOfCasesWithArticle = setOfCasesWithArticle;
        }
        else {
            self.labels = exports.CollectionLabels.create({ setOfCasesWithArticle: setOfCasesWithArticle });
        }
    }
}); })
    .actions(function (self) { return ({
    setLabels: function (labels) {
        if (labels.singleCase)
            self.setSingleCase(labels.singleCase);
        if (labels.pluralCase)
            self.setPluralCase(labels.pluralCase);
        if (labels.singleCaseWithArticle)
            self.setSingleCaseWithArticle(labels.singleCaseWithArticle);
        if (labels.setOfCases)
            self.setSetOfCases(labels.setOfCases);
        if (labels.setOfCasesWithArticle)
            self.setSetOfCasesWithArticle(labels.setOfCasesWithArticle);
    }
}); })
    .actions(function (self) { return ({
    afterCreate: function () {
        if (self._groupKeyCaseIds) {
            self.groupKeyCaseIds = new Map(self._groupKeyCaseIds);
        }
        // changes to a parent collection's attributes invalidate grouping
        (0, mobx_state_tree_1.addDisposer)(self, (0, mobx_1.reaction)(function () { return self.sortedDataAttributes.map(function (attr) { return attr.id; }); }, function () {
            if (self.child) {
                // There's a tradeoff here. By preserving the group key => case id mappings across
                // hierarchy changes, we allow case ids to be persistent across such hierarchy changes.
                // For instance, removing an attribute from a collection (which causes re-grouping) and
                // then adding it back will result in the same case ids as before. The cost of this,
                // however, is that collections maintain a history of all of the group key => case id
                // mappings that have ever come before, and this gets serialized as well. Conversely,
                // we can reduce the memory used by the collection and the size of the serialized
                // document by clearing the map on hierarchy changes and accepting that new case ids
                // will be generated at these times. At this writing, it seems unlikely that large
                // documents with large numbers of cases that go through lots of different parent
                // case groupings will be particularly common, but we can revisit if necessary.
                // self.groupKeyCaseIds.clear()
                self.itemData.invalidate();
            }
        }, { name: "CollectionModel.sortedDataAttributes reaction", equals: mobx_1.comparer.structural }));
    },
    prepareSnapshot: function () {
        self._groupKeyCaseIds = Array.from(self.groupKeyCaseIds.entries());
    },
    completeSnapshot: function () {
    },
    addAttribute: function (attr, options) {
        var beforeIndex = (options === null || options === void 0 ? void 0 : options.before) ? self.getAttributeIndex(options.before) : -1;
        var afterIndex = (options === null || options === void 0 ? void 0 : options.after) ? self.getAttributeIndex(options.after) : -1;
        if (beforeIndex >= 0) {
            self.attributes.splice(beforeIndex, 0, attr);
        }
        else if (afterIndex >= 0) {
            self.attributes.splice(afterIndex + 1, 0, attr);
        }
        else {
            self.attributes.push(attr);
        }
    },
    removeAttribute: function (attrId) {
        var attr = self.getAttribute(attrId);
        attr && self.attributes.remove(attr);
    }
}); })
    .actions(function (self) { return ({
    moveAttribute: function (attrId, options) {
        var attr = self.getAttribute(attrId);
        // is the attribute being moved before/after itself?
        var isMoving = attrId !== (options === null || options === void 0 ? void 0 : options.after) && attrId !== (options === null || options === void 0 ? void 0 : options.before);
        if (attr && isMoving) {
            self.removeAttribute(attr.id);
            self.addAttribute(attr, options);
        }
    }
}); });
function isCollectionModel(model) {
    return !!model && (0, mobx_state_tree_1.getType)(model) === exports.CollectionModel;
}
function syncCollectionLinks(collections, itemData) {
    collections.forEach(function (collection, index) {
        if (index === 0) {
            collection.setParent();
        }
        if (index > 0) {
            collection.setParent(collections[index - 1]);
        }
        if (index < collections.length - 1) {
            collection.setChild(collections[index + 1]);
        }
        if (index === collections.length - 1) {
            collection.setChild();
        }
        collection.setItemData(itemData);
    });
}
