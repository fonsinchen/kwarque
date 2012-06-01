// Example: $('#slider-range').bouncyslider(-1000000000, 1000000000);

(function(K, $) {
    $.fn.bouncyslider = function(min, max, lower, upper) {
        
        var range = function() {return K.dce('div').addClass("ui-slider-range");};
        var slider = K.dce('div').appendTo(this);
        var labels = K.dce('div').addClass("ui-slider ui-slider-horizontal").appendTo(this);
        var widthTest = K.dce('span').height(0).text('8888/88/88').appendTo(labels);
        var cutoff = widthTest.width();
        widthTest.remove();
        
        var leftLabels = range().css('text-align', 'right').appendTo(labels);
        var centerLabels = range().css('text-align', 'center').appendTo(labels);
        var rightLabels = range().css('text-align', 'left').appendTo(labels);

        var calcInterval = function(ui) {
            var transpose = function(range, diff) {
                diff = diff * 3 / (max - min)
                return (diff < 0 ? -1 : 1) * diff * diff * range;
            };
            var curLower = lower, curUpper = upper;
            if (ui.value === ui.values[0]) {
                var diffLower = ui.value - (2 * min + max) / 3;
                if (diffLower < 0) {
                    curLower += transpose(lower - min, diffLower);
                } else if (diffLower > 0) {
                    curLower += transpose(upper - lower, diffLower);
                }
            }
            if (ui.value === ui.values[1]) {
                var diffUpper = (min + 2 * max) / 3 - ui.value;
                if (diffUpper < 0) {
                    curUpper -= transpose(max - upper, diffUpper);
                } else if (diffUpper > 0) {
                    curUpper -= transpose(upper - lower, diffUpper);
                }
            }
            curLower = Math.max(min, curLower);
            curUpper = Math.min(max, curUpper);
            return [Math.min(curLower, curUpper), Math.max(curLower, curUpper)];
        }

        var adjustLabels = function(event, ui) {
            var left = Math.round((ui.values[0] - min) * 100 / (max - min));
            var right = Math.round((ui.values[1] - min) * 100 / (max - min));
            if ((right - left) * labels.width() / 100 > cutoff) {
                leftLabels.css('width', left + '%');
                centerLabels.css({
                    left : left + '%',
                    width : (right - left) + '%'
                });
                rightLabels.css({
                    left : right + '%',
                    width : (100 - right) + '%'
                });
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
                start = startDate.getFullYear() + '/' + month(startDate) + '/' + day(startDate);
                end = endDate.getFullYear() + '/' + month(endDate) + '/' + day(endDate);
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