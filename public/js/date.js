
(function(K) {
    var nullpad = function(number) {
        return (number < 10 ? '0' : '') + number;
    };
    K.date = {
        month : function(date) {
            return nullpad(date.getMonth() + 1);
        },
        day : function(date) {
            return nullpad(date.getDate());
        },
        time : function(date) {
            return nullpad(date.getHours()) + ':' + nullpad(date.getMinutes());
        },
        format : function(date) {
            return date.getFullYear() + '/' + K.date.month(date) + '/' +
                K.date.day(date) + ' ' + K.date.time(date);
        }
    };
    K.date.labels = function(startVal, endVal) {
        var startDate = new Date(startVal);
        var endDate = new Date(endVal);
        var common = '';
        var start = '';
        var end = '';
        if (startDate.getFullYear() === endDate.getFullYear()) {
            common += startDate.getFullYear();
            if (startDate.getMonth() === endDate.getMonth()) {
                common += '/' + K.date.month(startDate);
                if (startDate.getDate() === endDate.getDate()) {
                    common += '/' + K.date.day(startDate);
                } else {
                    start = K.date.day(startDate);
                    end = K.date.day(endDate);
                }
            } else {
                start = K.date.month(startDate) + '/' + K.date.day(startDate);
                end = K.date.month(endDate) + '/' + K.date.day(endDate);
            }
        } else {
            start = startDate.getFullYear();
            end = endDate.getFullYear();
            var yeardiff = end - start;
            if (yeardiff < 10) {
                start += '/' + K.date.month(startDate);
                end += '/' + K.date.month(endDate);
                if (yeardiff < 3) {
                    start += '/' + K.date.day(startDate);
                    end += '/' + K.date.day(endDate);
                }
            }
        }
        if (startVal - endVal < 7 * 86400000) {
            start += ' ' + K.date.time(startDate);
            end += ' ' + K.date.time(endDate);
        }
        return [start, common, end];
    }
})(KWARQUE);