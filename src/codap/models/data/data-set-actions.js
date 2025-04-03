"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSelectionAction = exports.isPartialSelectionAction = exports.isRemoveCasesAction = exports.isSetAttributeNameAction = exports.isSetCaseValuesAction = exports.isAddCasesAction = void 0;
var isAddCasesAction = function (action) {
    return action.name === "addCases";
};
exports.isAddCasesAction = isAddCasesAction;
var isSetCaseValuesAction = function (action) {
    return action.name === "setCaseValues";
};
exports.isSetCaseValuesAction = isSetCaseValuesAction;
var isSetAttributeNameAction = function (action) {
    return action.name === "setAttributeName";
};
exports.isSetAttributeNameAction = isSetAttributeNameAction;
var isRemoveCasesAction = function (action) {
    return action.name === "removeCases";
};
exports.isRemoveCasesAction = isRemoveCasesAction;
var isPartialSelectionAction = function (action) {
    return ["selectCases", "setSelectedCases"].includes(action.name);
};
exports.isPartialSelectionAction = isPartialSelectionAction;
var isSelectionAction = function (action) {
    return ["selectAll", "selectCases", "setSelectedCases"].includes(action.name);
};
exports.isSelectionAction = isSelectionAction;
