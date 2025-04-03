"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V2Model = void 0;
exports.isV2ModelSnapshot = isV2ModelSnapshot;
exports.v2NameTitleToV3Title = v2NameTitleToV3Title;
exports.v2ModelSnapshotFromV2ModelStorage = v2ModelSnapshotFromV2ModelStorage;
var mobx_state_tree_1 = require("mobx-state-tree");
var codap_utils_1 = require("../../utilities/codap-utils");
exports.V2Model = mobx_state_tree_1.types.model("V2Model", {
    id: (0, codap_utils_1.typeV3Id)(""),
    // required for objects in documents
    name: "",
    _title: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string)
})
    .views(function (self) { return ({
    get title() {
        var _a;
        return (_a = self._title) !== null && _a !== void 0 ? _a : self.name;
    },
    get userSetTitle() {
        return self._title != null;
    },
    matchNameOrId: function (nameOrId) {
        /* eslint-disable eqeqeq */
        return (!!self.name && self.name == nameOrId) ||
            (self.id == nameOrId) ||
            (self.id == (0, codap_utils_1.toV3DataSetId)(nameOrId)) ||
            (typeof nameOrId === "number" && (0, codap_utils_1.toV2Id)(self.id) === nameOrId);
        /* eslint-enable eqeqeq */
    }
}); })
    .views(function (self) { return ({
    matchTitleOrNameOrId: function (titleOrNameOrId) {
        return (self.title && self.title === titleOrNameOrId) || self.matchNameOrId(titleOrNameOrId);
    }
}); })
    .actions(function (self) { return ({
    // some models allow changing name
    setName: function (name) {
        self.name = name;
    },
    setTitle: function (title) {
        self._title = title;
    }
}); });
function isV2ModelSnapshot(snap) {
    return (snap === null || snap === void 0 ? void 0 : snap.guid) != null;
}
function v2NameTitleToV3Title(name, v2Title) {
    // only store the title if it's different than name
    return v2Title && v2Title !== name ? v2Title : undefined;
}
function v2ModelSnapshotFromV2ModelStorage(prefix, storage) {
    var id = storage.id, guid = storage.guid, _a = storage.name, name = _a === void 0 ? "" : _a, title = storage.title;
    var v2ModelSnapshot = {
        id: id ? (0, codap_utils_1.toV3Id)(prefix, id) : guid ? (0, codap_utils_1.toV3Id)(prefix, guid) : undefined,
        name: name,
        _title: v2NameTitleToV3Title(name, title)
    };
    return v2ModelSnapshot;
}
