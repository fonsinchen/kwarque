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

var wrapAround = function(min, max, val1, val2) {
    var wrapped = false;
    if (val1 < min) {
        wrapped = true;
        val1 = max - min + val1;
    }
    if (val2 > max) {
        wrapped = true;
        val2 = min + val2 - max;
    }
    if (wrapped && val1 <= val2) {
        return [min, max];
    } else {
        return [val1, val2];
    }
}

var exports = {};
exports.rasterize = function(type, a, b) {
    type = raster[type];
    var wrapped = wrapAround(type.min, type.max, Math.floor(a), Math.ceil(b));
    a = wrapped[0];
    b = wrapped[1];
    var prevA = Math.floor(a / type.levels[0]);    
    var prevB = Math.ceil(b / type.levels[0]);

    var i = 1;
    for (; i < type.levels.length; ++i) {
        var offsetA = Math.floor(a / type.levels[i]);
        var offsetB = Math.ceil(b / type.levels[i]);
        if (Math.abs(offsetB - offsetA) > 2) {
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
    if (offsetA === offsetB) {
        if (offsetB < type.max) {
            offsetB++;
        } else {
            offsetB = type.min;
        }
    }
    return {level : i - 1, values : [offsetA  * type.levels[i - 1], offsetB  * type.levels[i - 1]]};
}

exports.transform = function(type, intervals, targetLevel) {
    type = raster[type];
    var levelIntervals = intervals.values;
    var first = levelIntervals[0];
    var last = levelIntervals[levelIntervals.length - 1];
    var newIntervals = [];
    var offsetA = Math.floor(first / type.levels[targetLevel]);
    var offsetB = Math.ceil(last / type.levels[targetLevel]);
    var maxOffset = Math.ceil(type.max / type.levels[targetLevel]);
    var minOffset = Math.floor(type.min / type.levels[targetLevel]);
    for (var i = offsetA; i <= offsetB; ++i) {
        newIntervals.push(type.levels[targetLevel] * i);
        if (i === maxOffset) i = minOffset;
    }
    return {level : targetLevel, values : newIntervals};
}

exports.min = function(type) {return raster[type].min;}
exports.max = function(type) {return raster[type].max;}

K.raster = exports;

})(KWARQUE)
