"use strict";

/*!
 * This file is part of kwarque.
 * Copyright(c) 2012 Ulf Hermann <ulf_hermann@gmx.net>
 * Licensed under AGPL v3, see COPYING
 */

(function (K, $) {
    var dimensions = {
        x : -20037508.34,
        y : -20037508.34,
        w : 20037508.34 * 2,
        h : 20037508.34 * 2
    };
    
    var openDialog = function(dialog, w, h) {
        dialog.dialog('open');
        dialog.dialog('option', 'width',  w * 0.8);
        dialog.dialog('option', 'height', h * 0.8);
        dialog.dialog('option', 'position', [w * 0.1, h * 0.1]);    
    };

    var methods = {
        init : function() {
            var treeparams = K.create(dimensions);
            treeparams.maxDepth = 16;
            treeparams.maxChildren = 128;
            var tree = K.quadtree.init(treeparams)
            var map = new OpenLayers.Map({
                div : this[0],
                eventListeners : {
                    moveend : function() {
                        var extent = map.getExtent();
                        tree.prepare({
                            x : extent.left,
                            y : extent.bottom,
                            w : extent.right - extent.left,
                            h : extent.top - extent.bottom
                        }, function(node) {
                            K.chat.emit("watch", node, function(status) {
                                if (status === 'error') console.log('db error, needs handling');
                            });
                        });
                    }
                }
            });
            map.addLayer(new OpenLayers.Layer.OSM());
 
            var lonLat = new OpenLayers.LonLat(1495588,6888577);
 
            var markers = new OpenLayers.Layer.Markers( "Markers" );
            var element = $(this);
            var dialog = $(this).find('.kwarque-map-popup').dialog({
                autoOpen : false
            });
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
                    openDialog(input, element.width(), element.height());
                    clickHandler.deactivate();
                }
            });
            var button = $(this).find('.kwarque-map-add');
            button.button().click(function() {
                clickHandler.activate();
            });
            K.on('login', function() {
                button.show();
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
            
            data.input.find('form').submit(function(e) {
                e.preventDefault();
                var el = $(this);
                var content = {
                    type : "fragment",
                    x : el.find('.kwarque-map-input-lon').val(),
                    y : el.find('.kwarque-map-input-lat').val(),
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
            var lonLat = new OpenLayers.LonLat(content.x, content.y);
            
            var feature = new OpenLayers.Feature(data.markers, lonLat);
            feature.data = content;
            
            var marker = new OpenLayers.Marker(lonLat);
            marker.feature = feature;

            var element = $(this);
            var markerClick = function(evt) {
                data.dialog.dialog('option', 'title', this.data.title);
                data.dialog.find('.kwarque-map-popup-text').text(this.data.text);
                openDialog(data.dialog, element.width(), element.height());
                K.emit('fragmentOpened', this.data);
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