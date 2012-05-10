"use strict";

/*!
 * This file is part of kwarque.
 * Copyright(c) 2012 Ulf Hermann <ulf_hermann@gmx.net>
 * Licensed under AGPL v3, see COPYING
 */

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        if (this == null) throw new TypeError();
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) return -1;
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) return -1;
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) return k;
        }
        return -1;
    }
}

var KWARQUE = {};

(function (K, $) {
    K.create = function (obj) {
        var F = function() {};
        F.prototype = obj;
        return new F();
    };

    K.dce = function (name) {
        return $(document.createElement(name));
    };

    K.dctn = function (text) {
        return $(document.createTextNode(text));
    }

    K.callPlugin = function (elements, methods, args) {
        var ret = null;
        $.each(elements, function (i, inst) {
            if (methods[args[0]]) {
                // for now only the last value is returned. More sophisticated
                // things could be done here to return all values from all
                // elements.
                ret = methods[args[0]].apply($(inst), Array.prototype.slice.call(args, 1));
            } else if (typeof args[0] === 'object' || !args[0]) {
                methods.init.apply($(inst), args);
            } else {
                $.error('Method ' + args[0] + ' does not exist');
            }
        });
        return ret || elements;
    };

    var handlers = {};
    K.on = function (event, callback) {
        if (handlers[event]) {
            handlers[event].push(callback);
        } else {
            handlers[event] = [callback];
        }
    };

    K.un = function (event, callback) {
        $.each(handlers[event], function (i, handler) {
            if (callback === handler) {
                handlers[event].splice(i, 1);
                return false;
            } else {
                return true;
            }
        });
    }

    K.emit = function (event, data) {
        if (typeof handlers[event] === 'object') {
            $.each(handlers[event], function(i, handler) {
                handler(data);
            });
        }
    }
})(KWARQUE, jQuery);