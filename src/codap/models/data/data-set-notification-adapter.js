"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDataSetNotificationAdapter = setDataSetNotificationAdapter;
exports.getDataSetNotificationAdapter = getDataSetNotificationAdapter;
var gDataSetNotificationAdapter = {
    convertAttribute: function (attr, dataset) { return attr; },
    convertCase: function (_case, dataset) { return _case; }
};
function setDataSetNotificationAdapter(adapter) {
    gDataSetNotificationAdapter = adapter;
}
function getDataSetNotificationAdapter() {
    return gDataSetNotificationAdapter;
}
