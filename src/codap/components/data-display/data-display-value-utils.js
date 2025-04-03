"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataDisplayGetNumericValue = void 0;
var date_utils_1 = require("../../utilities/date-utils");
// For graphs and map legends, we need date values to be returned as numbers
var dataDisplayGetNumericValue = function (dataset, caseID, attrID) {
    var _a;
    var attr = dataset === null || dataset === void 0 ? void 0 : dataset.getAttribute(attrID);
    var index = dataset === null || dataset === void 0 ? void 0 : dataset.getItemIndexForCaseOrItem(caseID);
    if ((attr === null || attr === void 0 ? void 0 : attr.type) === 'date' && index != null) {
        var dateInMS = (_a = (0, date_utils_1.convertToDate)(dataset === null || dataset === void 0 ? void 0 : dataset.getStrValueAtItemIndex(index, attrID))) === null || _a === void 0 ? void 0 : _a.valueOf();
        return dateInMS ? dateInMS / 1000 : undefined;
    }
    return dataset === null || dataset === void 0 ? void 0 : dataset.getNumeric(caseID, attrID);
};
exports.dataDisplayGetNumericValue = dataDisplayGetNumericValue;
