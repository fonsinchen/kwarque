"use strict";
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
})(KWARQUE, jQuery);