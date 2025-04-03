"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorySet = void 0;
exports.getProvisionalDataSet = getProvisionalDataSet;
exports.createProvisionalCategorySet = createProvisionalCategorySet;
var mobx_1 = require("mobx");
var mobx_state_tree_1 = require("mobx-state-tree");
var color_utils_1 = require("../../utilities/color-utils");
var mst_utils_1 = require("../../utilities/mst-utils");
var attribute_1 = require("./attribute");
function getProvisionalDataSet(node) {
    var env = node && (0, mobx_state_tree_1.hasEnv)(node) ? (0, mobx_state_tree_1.getEnv)(node) : {};
    return env.provisionalDataSet;
}
// Provisional CategorySets are created with an MST environment that contains their DataSet.
// When a provisional CategorySet is promoted to a regular CategorySet and attached to the tree,
// it takes on the environment of its document (since MST environments are associated with the root
// of the tree). This allows references in CategorySets to be resolved directly via their DataSet
// for provisional CategorySets but then to be resolved normally by MST once they're promoted and
// added to the document.
function createProvisionalCategorySet(data, attrId) {
    return exports.CategorySet.create({ attribute: attrId }, { provisionalDataSet: data });
}
exports.CategorySet = mobx_state_tree_1.types.model("CategorySet", {
    // Customize the reference lookup so that provisional category sets are looked up directly in the DataSet.
    // Otherwise, references can only be resolved once the CategorySet has been added to the document, which
    // triggers undoable actions, etc.
    attribute: mobx_state_tree_1.types.reference(attribute_1.Attribute, {
        get: function (identifier, parent) {
            var _a;
            var provisionalDataSet = getProvisionalDataSet(parent);
            return (_a = provisionalDataSet === null || provisionalDataSet === void 0 ? void 0 : provisionalDataSet.attrFromID(identifier)) !== null && _a !== void 0 ? _a : (0, mobx_state_tree_1.resolveIdentifier)(attribute_1.Attribute, parent, identifier);
        },
        set: function (attribute) {
            return attribute.id;
        },
        onInvalidated: function (_a) {
            var _b;
            var self = _a.parent, invalidId = _a.invalidId;
            (_b = self.handleAttributeInvalidated) === null || _b === void 0 ? void 0 : _b.call(self, invalidId);
        }
    }),
    // user color assignments to categories in an attribute
    colors: mobx_state_tree_1.types.map(mobx_state_tree_1.types.string),
    // user category re-orderings
    moves: mobx_state_tree_1.types.array(mobx_state_tree_1.types.frozen())
})
    .volatile(function (self) { return ({
    provisionalAttributeActionDisposer: undefined,
    handleAttributeInvalidated: undefined,
}); })
    .actions(function (self) { return ({
    onAttributeInvalidated: function (handler) {
        self.handleAttributeInvalidated = handler;
    }
}); })
    .extend(function (self) {
    // map from category value to index
    var _indexMap = new Map();
    var observableValues = mobx_1.observable.array();
    var _values = [];
    var _isValid = mobx_1.observable.box(false);
    function rebuildIndexMap() {
        _indexMap.clear();
        _values.forEach(function (value, index) {
            _indexMap.set(value, index);
        });
    }
    function moveValueToIndex(value, dstIndex) {
        var valueIndex = _indexMap.get(value);
        if (valueIndex != null && valueIndex !== dstIndex) {
            var insertIndex = valueIndex < dstIndex ? dstIndex - 1 : dstIndex;
            // remove value from current position
            _values.splice(valueIndex, 1);
            // insert value in new position
            _values.splice(insertIndex, 0, value);
            // update the index map
            rebuildIndexMap();
        }
    }
    function refresh() {
        if (!_isValid.get()) {
            _indexMap.clear();
            _values = [];
            // build default category set order (order of occurrence)
            // could default to alphameric sort order if desired instead
            self.attribute.strValues.forEach(function (value) {
                if (value !== '' && _indexMap.get(value) == null) {
                    _indexMap.set(value, _values.length);
                    _values.push(value);
                }
            });
            // apply category moves
            self.moves.forEach(function (move) {
                var valueIndex = _indexMap.get(move.value);
                // the value associated with this category move is no longer one of the categories
                if (valueIndex == null)
                    return;
                var afterIndex = move.after ? _indexMap.get(move.after) : undefined;
                var beforeIndex = move.before ? _indexMap.get(move.before) : undefined;
                // both neighboring categories still exist?
                if ((afterIndex != null) && (beforeIndex != null)) {
                    // category is already (at least approximately) where it should be
                    if ((valueIndex >= afterIndex) && (valueIndex <= beforeIndex))
                        return;
                    // move it next to the category closest to its original position
                    var moveRatio = move.toIndex / move.length;
                    var afterRatio = (afterIndex + 1) / _values.length;
                    var beforeRatio = beforeIndex / _values.length;
                    var afterDistance = Math.abs(moveRatio - afterRatio);
                    var beforeDistance = Math.abs(moveRatio - beforeRatio);
                    var dstIndex = afterDistance < beforeDistance ? afterIndex + 1 : beforeIndex;
                    moveValueToIndex(move.value, dstIndex);
                }
                else if (afterIndex != null) {
                    moveValueToIndex(move.value, afterIndex + 1);
                }
                else if (beforeIndex != null) {
                    moveValueToIndex(move.value, beforeIndex);
                }
                else {
                    // neither category neighbor still exists
                    var moveRatio = move.toIndex / move.length;
                    // if it was moved near the beginning, put it at the beginning
                    if (moveRatio <= 0.2) {
                        moveValueToIndex(move.value, 0);
                    }
                    // if it was moved near the end, put it at the end
                    else if (moveRatio >= 0.8) {
                        moveValueToIndex(move.value, move.length - 1);
                    }
                    else {
                        // just punt for now
                    }
                }
            });
            (0, mobx_1.runInAction)(function () {
                observableValues.replace(_values);
                _isValid.set(true);
            });
        }
    }
    return {
        views: {
            get values() {
                refresh();
                return observableValues;
            },
            index: function (value) {
                refresh();
                return _indexMap.get(value);
            }
        },
        actions: {
            invalidate: function () {
                _isValid.set(false);
            }
        }
    };
})
    .views(function (self) { return ({
    get colorMap() {
        var colorForCategory = function (category) {
            var userColor = self.colors.get(category);
            if (userColor) {
                return userColor;
            }
            var catIndex = self.index(category);
            return catIndex != null ? color_utils_1.kellyColors[catIndex % color_utils_1.kellyColors.length] : undefined;
        };
        // We intentionally create a new non-observable map here.
        // This way this map object can be observed and if it changes a user knows the
        // colors or categories have changed
        var map = {};
        self.values.forEach(function (category) { return map[category] = colorForCategory(category); });
        return map;
    }
}); })
    .views(function (self) { return ({
    get valuesArray() {
        return Array.from(self.values);
    },
    get userActionNames() {
        // list of actions that indicate deliberate action by the user
        // used to determine when to move provisional category sets into the document
        return ["move", "setColorForCategory", "storeCurrentColorForCategory"];
    },
    get lastMove() {
        return self.moves.length > 0
            ? self.moves[self.moves.length - 1]
            : undefined;
    },
    colorForCategory: function (category) {
        return self.colorMap[category];
    }
}); })
    .actions(function (self) { return ({
    handleAttributeAction: function (action) {
        var actionsInvalidatingCategories = [
            "clearFormula", "setDisplayExpression", "addValue", "addValues", "setValue", "setValues", "removeValues"
        ];
        if (actionsInvalidatingCategories.includes(action.name)) {
            self.invalidate();
        }
    }
}); })
    .actions(function (self) { return ({
    afterCreate: function () {
        // invalidate the cached categories when necessary
        // afterAttach isn't called for provisional category sets, so we need to listen here
        var hasProvisionalDataSet = !!getProvisionalDataSet(self);
        if (hasProvisionalDataSet && (0, mobx_state_tree_1.isValidReference)(function () { return self.attribute; })) {
            var provisionalDisposer = (0, mst_utils_1.onAnyAction)(self.attribute, function (action) { return self.handleAttributeAction(action); });
            self.provisionalAttributeActionDisposer = provisionalDisposer;
            (0, mobx_state_tree_1.addDisposer)(self, function () { var _a; return (_a = self.provisionalAttributeActionDisposer) === null || _a === void 0 ? void 0 : _a.call(self); });
        }
    },
    afterAttach: function () {
        var _a;
        // invalidate the cached categories when necessary
        if ((0, mobx_state_tree_1.isValidReference)(function () { return self.attribute; })) {
            (_a = self.provisionalAttributeActionDisposer) === null || _a === void 0 ? void 0 : _a.call(self);
            self.provisionalAttributeActionDisposer = undefined;
            (0, mobx_state_tree_1.addDisposer)(self, (0, mst_utils_1.onAnyAction)(self.attribute, function (action) { return self.handleAttributeAction(action); }));
        }
    },
    move: function (value, beforeValue) {
        var _a;
        var fromIndex = self.index(value);
        if (fromIndex == null)
            return;
        var toIndex = (beforeValue != null) ? self.index(beforeValue) : undefined;
        if (toIndex === undefined) {
            toIndex = self.values.length - 1;
        }
        else if (fromIndex < toIndex) {
            toIndex--;
        }
        var afterIndex = toIndex === 0 ? undefined : toIndex < fromIndex ? toIndex - 1 : toIndex;
        var afterValue = afterIndex != null ? self.values[afterIndex] : undefined;
        var move = {
            value: value,
            fromIndex: fromIndex,
            toIndex: toIndex,
            length: self.values.length,
            after: afterValue,
            before: beforeValue
        };
        // combine with last move if appropriate
        if (value === ((_a = self.lastMove) === null || _a === void 0 ? void 0 : _a.value)) {
            move.fromIndex = self.lastMove.fromIndex;
            self.moves[self.moves.length - 1] = move;
        }
        else {
            self.moves.push(move);
        }
        self.invalidate();
    },
    setColorForCategory: function (value, color) {
        if (self.index(value) != null) {
            self.colors.set(value, color);
        }
    },
    storeCurrentColorForCategory: function (value) {
        var color = self.colorForCategory(value);
        if (color) {
            self.colors.set(value, color);
        }
    },
    storeAllCurrentColors: function () {
        var _this = this;
        self.values.forEach(function (value) {
            if (!self.colors.get(value)) {
                _this.storeCurrentColorForCategory(value);
            }
        });
    }
}); });
