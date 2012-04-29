"use strict";


(function (K) {
var raster = {
    lon : {
        min : -20037508,
        max : 20037508,
        levels: []
    }, lat : {
        min : -20037508,
        max : 20037508,
        levels: []
    }, t : {
        min : -8.64e+12,
        max : 8.64e+12,
        levels : []
    }
}

var calcLevels = function(type) {
    var max = type.max;
    var min = type.min;
    while (max - min > 1) {
        type.levels.push(Math.floor(max - min));
        max /= 2;
        min /= 2;
    }
};

for (var type in raster) {
    if (raster.hasOwnProperty(type)) {
        calcLevels(raster[type]);
    }
}

var exports = {};
exports.rasterize = function(type, a, b) {
    type = raster[type];

    if (a > type.max) a = type.max;
    if (a < type.min) a = type.min;
    if (b > type.max) b = type.max;
    if (b < type.min) b = type.min;
    
    var prevA = a;    
    var prevB = b;

    var i = 1;
    for (; i < type.levels.length; ++i) {
        var offsetA = Math.floor(a / type.levels[i]);
        var offsetB = Math.ceil(b / type.levels[i]);
        if (offsetB - offsetA > 2) {
            var ret = [prevA  * type.levels[i - 1]];
            if (prevB - prevA > 1) {
                ret.push((prevA + prevB) / 2 * type.levels[i - 1]);
            }
            ret.push(prevB  * type.levels[i - 1]);
            return {level : i - 1, values : ret};
        }
        prevA = offsetA;
        prevB = offsetB;
    }
    return {level : i, values : [offsetA  * type.levels[i], offsetB  * type.levels[i]]};
}

exports.transform = function(type, intervals, targetLevel) {
    type = raster[type];
    var levelIntervals = intervals.values;
    var first = levelIntervals[0];
    var last = levelIntervals[levelIntervals.length - 1];
    var newIntervals = [];
    var offsetA = Math.floor(first / type.levels[targetLevel]);
    var offsetB = Math.ceil(last / type.levels[targetLevel]);
    for (var i = offsetA; i <= offsetB; ++i) {
        newIntervals.push(type.levels[targetLevel] * i);
    }
    return {level : targetLevel, values : newIntervals};
}

K.raster = exports;

})(KWARQUE)
