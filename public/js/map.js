"use strict";

(function (K, $) {

    var methods = {
        init : function() {
            var map = new OpenLayers.Map({div : this[0]});
            map.addLayer(new OpenLayers.Layer.OSM());
 
            var lonLat = new OpenLayers.LonLat(13.41,52.52).transform(
                new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
                map.getProjectionObject() // to Spherical Mercator Projection
            );
 
            var markers = new OpenLayers.Layer.Markers( "Markers" );
            map.addLayer(markers);
            map.setCenter (lonLat, 16);
            this.data('kwarqueMap', {
                map : map,
                markers : markers
            });
            return this;
        },
        
        connect : function() {
            var self = this;
            K.chat.emit("data", {}, function(result) {
                for (var i = 0; i < result.rows.length; i++) {
                    self.kwarqueMap('addMarker', result.rows[i]);
                }
            });
            return this;
        },
        
        addMarker : function(content) {
            var data = this.data('kwarqueMap');
            var lonLat = new OpenLayers.LonLat(content.lon, content.lat).transform(
                new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
                data.map.getProjectionObject() // to Spherical Mercator Projection
            );
            
            var feature = new OpenLayers.Feature(data.markers, lonLat);
            feature.data = content;
            
            var marker = new OpenLayers.Marker(lonLat);
            marker.feature = feature;

            var markerClick = function(evt) {
                var widget = $(this.layer.map.div).find('.kwarque-map-popup');
                widget.find('.kwarque-map-popup-title').text(this.data.title);
                widget.find('.kwarque-map-popup-text').text(this.data.text);
                widget.find('.kwarque-map-popup-close').click(function() {
                    widget.hide();
                });
                widget.show();
                OpenLayers.Event.stop(evt);
            };
            marker.events.register("mousedown", feature, markerClick);

            data.markers.addMarker(marker);
            return this;
        },
        
        removeMarker : function() {
            
        }
    }
    
    $.fn.kwarqueMap = function () {
        return K.callPlugin(this, methods, arguments);
	};
    
})(KWARQUE, jQuery);