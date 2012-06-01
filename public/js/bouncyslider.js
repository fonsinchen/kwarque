// Example: $('#slider-range').bouncyslider(-1000000000, 1000000000);

(function(K, $) {
    $.fn.bouncyslider = function(min, max, lower, upper, exponent, innerExponent) {
        if (exponent === undefined) exponent = 1;
        if (innerExponent === undefined) innerExponent = 1;
        var range = function() {return K.dce('div').addClass("ui-slider-range");};
        var slider = K.dce('div').appendTo(this);
        var labels = K.dce('div').addClass("ui-slider ui-slider-horizontal ui-slider-labels").appendTo(this);
        var widthTest = K.dce('span').height(0).text('8888/88/88').appendTo(labels);
        var cutoff = widthTest.width();
        widthTest.remove();
        
        var leftLabels = range().css('text-align', 'right').appendTo(labels);
        var centerLabels = range().css('text-align', 'center').appendTo(labels);
        var rightLabels = range().css('text-align', 'left').appendTo(labels);

        var calcInterval = function(ui) {
            var transpose = function(range, diff, exponent) {
                diff = diff * 3 / (max - min);
                var sign = (diff < 0 ? -1 : 1);
                return sign * range * Math.pow(diff * sign, exponent);
            };
            var curLower = lower, curUpper = upper;
            if (ui.value === ui.values[0]) {
                var diffLower = ui.value - (2 * min + max) / 3;
                if (diffLower < 0) {
                    curLower += transpose(lower - min, diffLower, exponent);
                } else if (diffLower > 0) {
                    curLower += transpose(upper - lower, diffLower, innerExponent);
                }
            }
            if (ui.value === ui.values[1]) {
                var diffUpper = (min + 2 * max) / 3 - ui.value;
                if (diffUpper < 0) {
                    curUpper -= transpose(max - upper, diffUpper, exponent);
                } else if (diffUpper > 0) {
                    curUpper -= transpose(upper - lower, diffUpper, innerExponent);
                }
            }
            curLower = Math.max(min, curLower);
            curUpper = Math.min(max, curUpper);
            return [Math.min(curLower, curUpper), Math.max(curLower, curUpper)];
        }

        var adjustLabels = function(event, ui) {
            var left = Math.round((ui.values[0] - min) * 100 / (max - min));
            var right = Math.round((ui.values[1] - min) * 100 / (max - min));
            var cutoffPercentage = cutoff * 100 / labels.width()
            if ((right - left) > cutoffPercentage) {
                leftLabels.css('right', 100 - left + '%');
                centerLabels.css('left', (right + left - cutoffPercentage) / 2 + '%');
                centerLabels.css('width', cutoff + 'px');
                rightLabels.css('left', right + '%');
            }
            var interval = calcInterval(ui);
            var startDate = new Date(interval[0]);
            var endDate = new Date(interval[1]);
            var common = '';
            var start = '';
            var end = '';
            var nullpad = function(number) {
                return (number < 10 ? '0' : '') + number;
            }
            var month = function(date) {
                return nullpad(date.getMonth() + 1);
            }
            var day = function(date) {
                return nullpad(date.getDate());
            }
            var time = function(date) {
                return nullpad(date.getHours()) + ':' + nullpad(date.getMinutes());
            }
            if (startDate.getFullYear() === endDate.getFullYear()) {
                centerLabels.show();
                common += startDate.getFullYear();
                if (startDate.getMonth() === endDate.getMonth()) {
                    common += '/' + month(startDate);
                    if (startDate.getDate() === endDate.getDate()) {
                        common += '/' + day(startDate);
                    } else {
                        start = day(startDate);
                        end = day(endDate);
                    }
                } else {
                    start = month(startDate) + '/' + day(startDate);
                    end = month(endDate) + '/' + day(endDate);
                }
            } else {
                centerLabels.hide();
                start = startDate.getFullYear();
                end = endDate.getFullYear();
                var yeardiff = end - start;
                if (yeardiff < 10) {
                    start += '/' + month(startDate);
                    end += '/' + month(endDate);
                    if (yeardiff < 3) {
                        start += '/' + day(startDate);
                        end += '/' + day(endDate);
                    }
                }
            }
            if (interval[1] - interval[0] < 7 * 86400000) {
                start += ' ' + time(startDate);
                end += ' ' + time(endDate);
            }

            leftLabels.text(start);
            rightLabels.text(end);
            centerLabels.text(common);
        };
        
        slider.slider({
            range: true,
            min: min,
            max: max,
            values: [ (2 * min + max) / 3 , (min + 2 * max) / 3 ],
            stop: function(event, ui) {
                var interval = calcInterval(ui);
                lower = interval[0];
                upper = interval[1];
                slider.slider('values', 0, (2 * min + max) / 3);
                slider.slider('values', 1, (min + 2 * max) / 3);
            },
            change : adjustLabels,
            slide: adjustLabels
        });
        var onethird = slider.slider('values', 0);
        var twothird = slider.slider('values', 1);
        if (lower === undefined) lower = onethird;
        if (upper === undefined) upper = twothird;
        adjustLabels(null, {values : [onethird, twothird]});
    }
})(KWARQUE, jQuery);
