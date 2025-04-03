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
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataContextCountChangedNotification = void 0;
exports.dataContextDeletedNotification = dataContextDeletedNotification;
exports.updateDataContextNotification = updateDataContextNotification;
exports.createCollectionNotification = createCollectionNotification;
exports.deleteCollectionNotification = deleteCollectionNotification;
exports.updateCollectionNotification = updateCollectionNotification;
exports.createAttributesNotification = createAttributesNotification;
exports.hideAttributeNotification = hideAttributeNotification;
exports.moveAttributeNotification = moveAttributeNotification;
exports.removeAttributesNotification = removeAttributesNotification;
exports.updateAttributesNotification = updateAttributesNotification;
exports.createCasesNotification = createCasesNotification;
exports.moveCasesNotification = moveCasesNotification;
exports.updateCasesNotification = updateCasesNotification;
exports.updateCasesNotificationFromIds = updateCasesNotificationFromIds;
exports.deleteCasesNotification = deleteCasesNotification;
exports.selectCasesNotification = selectCasesNotification;
var debug_1 = require("../../lib/debug");
var codap_utils_1 = require("../../utilities/codap-utils");
var data_set_notification_adapter_1 = require("./data-set-notification-adapter");
var action = "notify";
function makeCallback(operation, other) {
    return function (response) {
        return (0, debug_1.debugLog)(debug_1.DEBUG_PLUGINS, "Reply to ".concat(action, " ").concat(operation, " ").concat(other !== null && other !== void 0 ? other : ""), JSON.stringify(response));
    };
}
function notification(operation, result, dataSet, _callback, extraValues) {
    var resource = dataSet ? "dataContextChangeNotice[".concat(dataSet.name, "]") : "documentChangeNotice";
    var values = __assign({ operation: operation, result: result }, extraValues);
    var callback = _callback !== null && _callback !== void 0 ? _callback : makeCallback(operation);
    return { message: { action: action, resource: resource, values: values }, callback: callback };
}
exports.dataContextCountChangedNotification = notification("dataContextCountChanged");
function dataContextDeletedNotification(dataSet) {
    return notification("dataContextDeleted", undefined, undefined, undefined, { deletedContext: dataSet.name });
}
function updateDataContextNotification(dataSet) {
    var result = {
        success: true,
        properties: {
            description: dataSet.description,
            importDate: dataSet.importDate,
            name: dataSet.name,
            sourceName: dataSet.sourceName,
            title: dataSet._title
        }
    };
    return notification("updateDataContext", result, dataSet);
}
function createCollectionNotification(collection, dataSet) {
    var _a;
    var result = {
        success: true,
        collection: (0, codap_utils_1.toV2Id)(collection.id),
        name: collection.name,
        attribute: (_a = collection.attributes[0]) === null || _a === void 0 ? void 0 : _a.name
    };
    return notification("createCollection", result, dataSet);
}
function deleteCollectionNotification(dataSet) {
    var result = { success: true };
    return notification("deleteCollection", result, dataSet);
}
function updateCollectionNotification(collection, dataSet) {
    var result = { success: true, properties: { name: collection === null || collection === void 0 ? void 0 : collection.name } };
    return notification("updateCollection", result, dataSet);
}
function attributeNotification(operation, data, attrIDs, attrs) {
    var adapter = (0, data_set_notification_adapter_1.getDataSetNotificationAdapter)();
    var result = {
        success: true,
        attrs: attrs === null || attrs === void 0 ? void 0 : attrs.map(function (attr) { return adapter.convertAttribute(attr, data); }),
        attrIDs: attrIDs === null || attrIDs === void 0 ? void 0 : attrIDs.map(function (attrID) { return (0, codap_utils_1.toV2Id)(attrID); })
    };
    return notification(operation, result, data, makeCallback(operation, attrIDs));
}
function createAttributesNotification(attrs, data) {
    return attributeNotification("createAttributes", data, attrs.map(function (attr) { return attr.id; }), attrs);
}
function hideAttributeNotification(attrIDs, data, operation) {
    if (operation === void 0) { operation = "hideAttributes"; }
    return attributeNotification(operation, data, attrIDs);
}
function moveAttributeNotification(data) {
    return attributeNotification("moveAttribute", data);
}
function removeAttributesNotification(attrIDs, data) {
    return attributeNotification("deleteAttributes", data, attrIDs);
}
function updateAttributesNotification(attrs, data) {
    return attributeNotification("updateAttributes", data, attrs.map(function (attr) { return attr.id; }), attrs);
}
function createCasesNotification(caseIDs, data) {
    var caseID = caseIDs.length > 0 ? (0, codap_utils_1.toV2Id)(caseIDs[0]) : undefined;
    var itemIDs = [];
    caseIDs.forEach(function (caseId) {
        var aCase = data === null || data === void 0 ? void 0 : data.caseInfoMap.get(caseId);
        if (aCase) {
            itemIDs = itemIDs.concat(aCase.childItemIds.concat(aCase.hiddenChildItemIds).map(function (itemId) { return (0, codap_utils_1.toV2Id)(itemId); }));
        }
    });
    var itemID = itemIDs.length > 0 ? itemIDs[0] : undefined;
    var result = {
        success: true,
        caseIDs: caseIDs ? caseIDs.map(function (caseId) { return (0, codap_utils_1.toV2Id)(caseId); }) : [],
        itemIDs: itemIDs,
        caseID: caseID,
        itemID: itemID
    };
    return notification("createCases", result, data);
}
function moveCasesNotification(data, cases) {
    if (cases === void 0) { cases = []; }
    var result = {
        success: true,
        caseIDs: cases.map(function (aCase) { return (0, codap_utils_1.toV2Id)(aCase.__id__); })
    };
    return notification("moveCases", result, data);
}
function updateCasesNotification(data, cases) {
    var adapter = (0, data_set_notification_adapter_1.getDataSetNotificationAdapter)();
    var caseIDs = cases === null || cases === void 0 ? void 0 : cases.map(function (c) { return (0, codap_utils_1.toV2Id)(c.__id__); });
    var result = {
        success: true,
        caseIDs: caseIDs,
        cases: cases === null || cases === void 0 ? void 0 : cases.map(function (c) { return adapter.convertCase(c, data); })
    };
    return notification("updateCases", result, data);
}
function updateCasesNotificationFromIds(data, caseIds) {
    data.validateCases();
    var cases = caseIds === null || caseIds === void 0 ? void 0 : caseIds.map(function (caseId) { return data.caseInfoMap.get(caseId); }).filter(function (caseGroup) { return !!caseGroup; }).map(function (caseGroup) { return caseGroup.groupedCase; });
    return updateCasesNotification(data, cases);
}
function deleteCasesNotification(data, cases) {
    var adapter = (0, data_set_notification_adapter_1.getDataSetNotificationAdapter)();
    var result = {
        success: true,
        cases: cases === null || cases === void 0 ? void 0 : cases.map(function (c) { return adapter.convertCase(c, data); })
    };
    return notification("deleteCases", result, data);
}
// selectCasesNotification returns a function that will later be called to determine if the selection
// actually changed and a notification is necessary to broadcast
function selectCasesNotification(dataset, extend) {
    var getSelectedCaseIds = function (selectedItemIds) {
        var caseIds = [];
        Array.from(dataset.caseInfoMap.values()).forEach(function (aCase) {
            if (aCase.childItemIds.length && aCase.childItemIds.every(function (itemId) { return selectedItemIds.has(itemId); })) {
                caseIds.push(aCase.groupedCase.__id__);
            }
        });
        return caseIds;
    };
    var oldSelectedItemIds = Array.from(dataset.selection);
    var oldSelectedItemIdSet = new Set(oldSelectedItemIds);
    var oldSelectedCaseIds = getSelectedCaseIds(oldSelectedItemIdSet);
    var oldSelectedCaseIdSet = new Set(oldSelectedCaseIds);
    var adapter = (0, data_set_notification_adapter_1.getDataSetNotificationAdapter)();
    return function () {
        var newSelectedItemIds = Array.from(dataset.selection);
        var newSelectedItemIdSet = new Set(newSelectedItemIds);
        var newSelectedCaseIds = getSelectedCaseIds(newSelectedItemIdSet);
        var newSelectedCaseIdSet = new Set(newSelectedCaseIds);
        var addedCaseIds = newSelectedCaseIds.filter(function (caseId) { return !oldSelectedCaseIdSet.has(caseId); });
        var removedCaseIds = oldSelectedCaseIds.filter(function (caseId) { return !newSelectedCaseIdSet.has(caseId); });
        // Only send a notification if the selection has actually changed
        if (addedCaseIds.length === 0 && removedCaseIds.length === 0)
            return;
        var convertCaseIdsToV2FullCases = function (_caseIds) {
            var caseGroups = _caseIds.map(function (caseId) { var _a; return (_a = dataset.caseInfoMap.get(caseId)) === null || _a === void 0 ? void 0 : _a.groupedCase; }).filter(function (c) { return !!c; });
            return caseGroups.map(function (groupedCase) { return adapter.convertCase(groupedCase, dataset); });
        };
        var caseIds = extend ? addedCaseIds : newSelectedCaseIds;
        var _cases = convertCaseIdsToV2FullCases(caseIds);
        var cases = extend
            ? _cases.length > 0 ? _cases : undefined
            : _cases;
        var removedCases = extend && removedCaseIds.length > 0
            ? convertCaseIdsToV2FullCases(removedCaseIds) : [];
        var result = { success: true, cases: cases, removedCases: removedCases, extend: !!extend };
        return notification("selectCases", result, dataset);
    };
}
