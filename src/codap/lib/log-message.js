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
exports.logMessageWithReplacement = logMessageWithReplacement;
exports.stringify = stringify;
exports.logStringifiedObjectMessage = logStringifiedObjectMessage;
exports.logModelChangeFn = logModelChangeFn;
var translate_1 = require("../utilities/translation/translate");
// e.g. logMessageWithReplacement("Moved category %@ into position of %@", { movedCat: string, targetCat: string })
function logMessageWithReplacement(message, args, category) {
    return { message: (0, translate_1.t)(message, { vars: Object.values(args) }), args: args, category: category };
}
function stringify(obj) {
    var values = Object.entries(obj).map(function (_a) {
        var key = _a[0], value = _a[1];
        return "".concat(key, ": ").concat(value);
    }).join(", ");
    return "{ ".concat(values, " }");
}
// e.g. logStringifiedObjectMessage("dragEnd: %@", { lower: number, upper: number })
function logStringifiedObjectMessage(message, args, category) {
    return { message: (0, translate_1.t)(message, { vars: [stringify(args)] }), args: args, category: category };
}
function logModelChangeFn(message, modelStateFn, options, category) {
    var _a = options || {}, initialArg = _a.initialArg, _b = _a.initialKeyFn, initialKeyFn = _b === void 0 ? (function (key) { return "".concat(key, "Initial"); }) : _b;
    // capture the relevant initial state of the model
    var initial = modelStateFn(initialArg);
    return function (finalArg) {
        // capture the relevant final state of the model
        var final = modelStateFn(finalArg);
        // combine initial and final values as replacement string values
        var vars = __spreadArray(__spreadArray([], Object.values(initial), true), Object.values(final), true);
        // append `Initial` to property names of initial values
        var argsInitial = Object.fromEntries(Object.entries(initial).map(function (_a) {
            var key = _a[0], value = _a[1];
            return [initialKeyFn(key), value];
        }));
        // final logged object contains initial and final values
        var args = __assign(__assign({}, argsInitial), final);
        return { message: (0, translate_1.t)(message, { vars: vars }), args: args, category: category };
    };
}
