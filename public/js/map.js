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
            markers.addMarker(new OpenLayers.Marker(lonLat));   
            this.data('kwarqueMap', {
                map : map,
                content : markers
            });
            return this;
        },
        //TODO: functions addMarker/removeMarker instead. Adds a marker, binds 
        // click handlers to it, opens popup as needed. We cannot bind click
        // handlers to the content layer.
        popup : function() {
            $('#kwarque-map-popup').mapPopup({
                map: this,
                contents: function(feature) {
                    return K.dce('p').text(feature.data.id);
                }
            });
        }
    }
    $.fn.kwarqueMap = function () {
        return K.callPlugin(this, methods, arguments);
	};
    
})(KWARQUE, jQuery);