(function($) {
    var onFeatureSelected = function(data) {
        var self = data.widget;
        var map = data.map;
        var layer = data.layer;
        var element = self.element;
        
        // save position so that the popup can be moved with the feature
        self.lonLat = $.MapQuery.getFeaturePosition(data.feature);
        
        var pixels = map.pixelsFromPosition(self.lonLat[0], self.lonLat[1]);
        element.show(0, function() {
            $(this).css('z-index', layer.zIndex()+1000);
            self._setPosition(map, pixels);
        });
        
        element.find('.ui-dialog-title').text(self.options.title);
        element.find('.ui-dialog-content').empty().append(self.options.contents.call(self, data.feature));
        element.find('a.ui-dialog-titlebar-close').bind('click', function() {
            element.hide();
            self.lonLat = null;
            layer.unselectFeature(data.feature);
        });
        
        // if the popup is outside of the view, pan in
        var xoffset = map.element.outerWidth() -
            (pixels[0] + element.outerWidth()) - self.options.padding;
        var yoffset = element.outerHeight() - pixels[1] + self.options.padding;
        map.pan(xoffset < 0 ? -xoffset : 0, yoffset > 0 ? -yoffset : 0);
    };

    var onFeatureUnselected = function(data) {
        var self = data.widget;
        self.element.hide();
        self.lonLat = null;
    };
    
    var onMove = function(data) {
        var self = data.widget;
        var map = data.map;

        if (!self.lonLat) {
            return;
        }

        var pixels = map.pixelsFromPosition(self.lonLat[0], self.lonLat[1]);
        if (pixels!==null) {
            self.element.show();
            self._setPosition(map, pixels);
        } else {
            self.element.hide();
        }
    }

    // Parts of the code were inspired by the code from GeoExt
    // (http://geoext.org/) which is licensed under BSD license
    $.widget("kwarque.mapPopup", {
        options: {
            // The OpenLayers map instance
            map: undefined,

            // A function that returns HTML to be put into the popup.
            // It has one argument, which is the OpenLayers feature that
            // was selected.
            contents: undefined,

            // Title that will be displayed at the top of the popup
            title: "Feature Popup",

            // Padding (in px) around the popup when it needs to be panned in
            padding: 10
        },
        _create: function() {
            var self = this;

            //get the mapquery object
            var data = $(this.options.map).data('kwarqueMap');
            var map = data.map;
            var layer = data.content;

            layer.events.on({
                "featureselected" : function() {
                    onFeatureSelected({
                        widget: self, 
                        map: map, 
                        layer: layer
                    });
                }, "featureunselected" : function() {
                    onFeatureUnselected({
                        widget: self
                    });
                }
            });
            this.element.addClass('ui-dialog ui-widget ui-widget-content ' +
                'ui-corner-all');

            map.events.on({
                "move" : function() {
                    onMove({
                        widget: self, 
                        map: map
                    });
                }
            });
        },
        _destroy: function() {
            this.element.removeClass('ui-dialog ui-widget ui-widget-content ' +
                'ui-corner-all')
            .empty();
        },
        _setPosition: function(map, pos) {
            this.element.position({
                my: "left bottom",
                at: "left top",
                of: map.element,
                offset: pos[0] + ' ' + pos[1],
                collision: 'none'
            });
        }

    });
})(jQuery);