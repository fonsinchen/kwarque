// Example: $('#slider-range').bouncyslider(-1000000000, 1000000000);

(function(K, $) {
    $.fn.bouncyslider = function(min, max) {
        var lower, upper;
        var range = function() {return K.dce('div').addClass("ui-slider-range");};
        var slider = K.dce('div').appendTo(this);
        var labels = K.dce('div').addClass("ui-slider ui-slider-horizontal").appendTo(this);
        var leftLabels = range().text(min).appendTo(labels);
        var centerLabels = range().appendTo(labels);
        var rightLabels = range().text(max).css("text-align", "right").appendTo(labels);
        var innerLabel = function() {
            return K.dce('span').css('position', 'absolute');
        }
        var lowerLabel = innerLabel().css('left', 0).appendTo(centerLabels);
        var upperLabel = innerLabel().css('right', 0).appendTo(centerLabels);

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
            leftLabels.css('width', left + '%');
            centerLabels.css({
                left : left + '%',
                width : (right - left) + '%'
            });
            rightLabels.css({
                left : right + '%',
                width : (100 - right) + '%'
            });
            var interval = calcInterval(ui);
            lowerLabel.text(Math.round(interval[0]));
            upperLabel.text(Math.round(interval[1]));
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
                $( "#amount" ).val(lower + " - " + upper);
                slider.slider('values', 0, (2 * min + max) / 3);
                slider.slider('values', 1, (min + 2 * max) / 3);
            },
            change : adjustLabels,
            slide: adjustLabels
        });
        lower = slider.slider('values', 0);
        upper = slider.slider('values', 1);
        adjustLabels(null, {values : [lower, upper]});
    }
})(KWARQUE, jQuery);
