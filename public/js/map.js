"use strict";

(function (K, $) {

    var methods = {
        init : function() {
            var map = new OpenLayers.Map({div : this[0]});
            map.addLayer(new OpenLayers.Layer.OSM());
 
            var lonLat = new OpenLayers.LonLat(1495588,6888577);
 
            var markers = new OpenLayers.Layer.Markers( "Markers" );
            var dialog = $(this).find('.kwarque-map-popup').dialog({autoOpen : false});
            var input = $(this).find('.kwarque-map-input').dialog({
                title : "write new fragment",
                autoOpen : false
            });
            map.addLayer(markers);
            map.setCenter (lonLat, 16);
            var clickHandler = new OpenLayers.Handler.Click({'map': map}, {
                'click': function(evt) {
                    var lonlat = map.getLonLatFromViewPortPx(evt.xy);
                    input.find('.kwarque-map-input-lon').val(lonlat.lon);
                    input.find('.kwarque-map-input-lat').val(lonlat.lat);
                    input.dialog('open');
                    clickHandler.deactivate();
                }
            });
            $(this).find('.kwarque-map-add').button().click(function() {
                clickHandler.activate();
            });
            this.data('kwarqueMap', {
                map : map,
                markers : markers,
                dialog : dialog,
                input : input
            });
            return this;
        },
        
        connect : function() {
            var self = this;
            K.chat.on("fragment", function(row) {
                self.kwarqueMap('addMarker', row);
            });
            var data = this.data("kwarqueMap");
            var extent = data.map.getExtent();
            K.chat.emit("watch", {
                lon : K.raster.rasterize("lon", extent.left, extent.right),
                lat : K.raster.rasterize("lat", extent.bottom, extent.top)
            }, function(status) {
                if (status === 'error') console.log('db error, needs handling');
            });
            data.input.find('form').submit(function(e) {
                e.preventDefault();
                var el = $(this);
                var content = {
                    type : "fragment",
                    lon : el.find('.kwarque-map-input-lon').val(),
                    lat : el.find('.kwarque-map-input-lat').val(),
                    title : el.find('.kwarque-map-input-title').val(),
                    text : el.find('.kwarque-map-input-text').val()
                };
                K.chat.emit("insert", content, function(result, id) {
                    if (result === 'end') {
                        content.id = id;
                        self.kwarqueMap('addMarker', content);
                        el.find('.kwarque-map-input-title, .kwarque-map-input-text').val('');
                        data.input.dialog('close');
                    } else {
                        // TODO: handle error
                    }
                });
            })
            return this;
        },
        
        addMarker : function(content) {
            var data = this.data('kwarqueMap');
            var lonLat = new OpenLayers.LonLat(content.lon, content.lat);
            
            var feature = new OpenLayers.Feature(data.markers, lonLat);
            feature.data = content;
            
            var marker = new OpenLayers.Marker(lonLat);
            marker.feature = feature;

            var markerClick = function(evt) {
                data.dialog.dialog('option', 'title', this.data.title);
                data.dialog.find('.kwarque-map-popup-text').text(this.data.text);
                data.dialog.dialog('open');
                K.emit('fragmentOpened', this.data.id);
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