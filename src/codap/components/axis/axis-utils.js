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
exports.getNumberOfLevelsForDateAxis = exports.isScaleLinear = exports.computeBestNumberOfTicks = exports.getCoordFunctions = exports.getCategoricalLabelPlacement = exports.collisionExists = exports.getStringBounds = void 0;
var date_utils_1 = require("../../utilities/date-utils");
var axis_constants_1 = require("./axis-constants");
var data_display_types_1 = require("../data-display/data-display-types");
var use_measure_text_1 = require("../../hooks/use-measure-text");
var getStringBounds = function (s, font) {
    if (s === void 0) { s = 'Wy'; }
    if (font === void 0) { font = data_display_types_1.kDataDisplayFont; }
    return (0, use_measure_text_1.measureTextExtent)(s, font);
};
exports.getStringBounds = getStringBounds;
var collisionExists = function (props) {
    /* A collision occurs when two labels overlap.
     * This can occur when labels are centered on the tick, or when they are left-aligned.
     * The former requires computation of two adjacent label widths.
     */
    var bandWidth = props.bandWidth, categories = props.categories, centerCategoryLabels = props.centerCategoryLabels, narrowedBandwidth = bandWidth - 5, labelWidths = categories.map(function (category) { return (0, exports.getStringBounds)(category).width; });
    return centerCategoryLabels ? labelWidths.some(function (width, i) {
        return i > 0 && width / 2 + labelWidths[i - 1] / 2 > narrowedBandwidth;
    }) : labelWidths.some(function (width) { return width > narrowedBandwidth; });
};
exports.collisionExists = collisionExists;
var getCategoricalLabelPlacement = function (axisPlace, centerCategoryLabels, collision) {
    var _a;
    var rotation = 'rotate(-90)'; // the only rotation value we use
    var labelPlacementMap = {
        left: {
            center: {
                collision: { textAnchor: 'end' },
                fit: { rotation: rotation, textAnchor: 'middle' }
            },
            justify: {
                collision: { textAnchor: 'end' },
                fit: { rotation: rotation, textAnchor: 'start' }
            }
        },
        rightCat: {
            center: {
                collision: { textAnchor: 'start' },
                fit: { rotation: rotation, textAnchor: 'middle' }
            },
            justify: {
                collision: { textAnchor: 'end' },
                fit: { rotation: rotation, textAnchor: 'start' }
            }
        },
        bottom: {
            center: {
                collision: {
                    rotation: rotation,
                    textAnchor: 'end'
                },
                fit: { textAnchor: 'middle' }
            },
            justify: {
                collision: { rotation: rotation, textAnchor: 'end' },
                fit: { textAnchor: 'start' }
            }
        },
        top: {
            center: {
                collision: {
                    rotation: rotation,
                    textAnchor: 'start'
                },
                fit: { textAnchor: 'middle' }
            },
            justify: {
                collision: { rotation: rotation, textAnchor: 'end' },
                fit: { textAnchor: 'start' }
            }
        }
    };
    var centerOrJustify = centerCategoryLabels ? "center" : "justify";
    var collisionOrFit = collision ? "collision" : "fit";
    var labelPlacement = (_a = labelPlacementMap[axisPlace]) === null || _a === void 0 ? void 0 : _a[centerOrJustify][collisionOrFit];
    return __assign({ rotation: '', textAnchor: 'none' }, labelPlacement);
};
exports.getCategoricalLabelPlacement = getCategoricalLabelPlacement;
var getCoordFunctions = function (props) {
    var numCategories = props.numCategories, centerCategoryLabels = props.centerCategoryLabels, collision = props.collision, axisIsVertical = props.axisIsVertical, rangeMin = props.rangeMin, rangeMax = props.rangeMax, subAxisLength = props.subAxisLength, isRightCat = props.isRightCat, isTop = props.isTop, dragInfo = props.dragInfo, bandWidth = subAxisLength / numCategories, labelTextHeight = (0, exports.getStringBounds)('12px sans-serif').height, indexOffset = centerCategoryLabels ? 0.5 : 0 /*(axisIsVertical ? 1 : 0)*/, dI = dragInfo.current;
    var labelXOffset = 0, labelYOffset = 0;
    var getTickCoord = function (i, rangeVal, sign) {
        return i === dI.indexOfCategory ? dI.currentDragPosition
            : rangeVal + sign * (i + indexOffset) * bandWidth;
    }, getTickX = function (i) {
        return getTickCoord(i, rangeMin, 1);
    }, getTickY = function (i) {
        return getTickCoord(i, rangeMax, -1);
    };
    switch (axisIsVertical) {
        case true:
            labelXOffset = collision ? 0 : 0.25 * labelTextHeight;
            return { getTickX: function () { return 0; }, getTickY: getTickY, getDividerX: function () { return 0; },
                getDividerY: function (i) { return rangeMax - (i + 1) * bandWidth; },
                getLabelX: function () { return (isRightCat ? 1.5 : -1) * (axis_constants_1.kAxisTickLength + axis_constants_1.kAxisGap + labelXOffset); },
                getLabelY: function (i) {
                    return (getTickY ? getTickY(i) : 0) + (collision ? 0.25 * labelTextHeight : 0);
                }
            };
        case false:
            labelYOffset = collision ? 0 : (isTop ? -0.15 : 0.75) * labelTextHeight;
            return {
                getTickX: getTickX,
                getTickY: function () { return 0; },
                getDividerX: function (i) { return rangeMin + i * bandWidth; },
                getDividerY: function () { return 0; },
                getLabelX: function (i) { return (getTickX ? getTickX(i) : 0) +
                    (collision ? 0.25 * labelTextHeight : 0); },
                getLabelY: function () { return (isTop ? -1 : 1) * (axis_constants_1.kAxisTickLength + axis_constants_1.kAxisGap) + labelYOffset; }
            };
    }
};
exports.getCoordFunctions = getCoordFunctions;
/**
 * Compute the best number of ticks for a given linear scale to prevent tick label collisions.
 * The function iteratively adjusts the number of ticks to find an optimal value that avoids
 * overlapping labels while maintaining a reasonable distribution of ticks.
 *
 * @param {ScaleLinear<number, number>} scale - The D3 linear scale for which to compute the optimal number of ticks.
 * @returns {number} - The computed optimal number of ticks for the given scale.
 */
var computeBestNumberOfTicks = function (scale) {
    var formatter = scale.tickFormat();
    // Helper function to detect collisions between tick labels
    var hasCollision = function (values) {
        return values.some(function (value, i) {
            if (i === values.length - 1)
                return false;
            var delta = scale(values[i + 1]) - scale(values[i]);
            var length = ((0, use_measure_text_1.measureText)(formatter(values[i])) + (0, use_measure_text_1.measureText)(formatter(values[i + 1]))) / 2;
            return length > delta;
        });
    };
    var tickValues = scale.ticks(), n1 = tickValues.length, n2 = n1, done = false, firstTime = true, currentNumber = n1;
    // Find the best number of ticks iteratively
    while (!done) {
        var colliding = hasCollision(tickValues);
        if (colliding) {
            n2 = n1;
            n1 = Math.floor(n1 / 2);
            currentNumber = n1;
        }
        else if (firstTime) {
            n2 *= 2;
            currentNumber = n2;
        }
        else {
            currentNumber = n1 + Math.floor((n2 - n1) / 2);
            done = currentNumber === n1 || currentNumber === n2;
            if (hasCollision(tickValues)) {
                n2 = currentNumber;
            }
            else {
                n1 = currentNumber;
            }
        }
        tickValues = scale.ticks(currentNumber);
        firstTime = false;
    }
    return Math.max(2, currentNumber);
};
exports.computeBestNumberOfTicks = computeBestNumberOfTicks;
var isScaleLinear = function (scale) {
    return scale.interpolate !== undefined;
};
exports.isScaleLinear = isScaleLinear;
var getNumberOfLevelsForDateAxis = function (minDateInSecs, maxDateInSecs) {
    var levels = (0, date_utils_1.determineLevels)(1000 * minDateInSecs, 1000 * maxDateInSecs);
    return levels.outerLevel !== levels.innerLevel ? 2 : 1;
};
exports.getNumberOfLevelsForDateAxis = getNumberOfLevelsForDateAxis;
