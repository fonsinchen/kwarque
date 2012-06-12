"use strict";

/*!
 * This file is part of kwarque.
 * Copyright(c) 2012 Ulf Hermann <ulf_hermann@gmx.net>
 * Licensed under AGPL v3, see COPYING
 */

(function (K, $) {
    var tree = K.quadtree.init({
        x : -20037508.34,
        y : -20037508.34,
        w : 20037508.34 * 2,
        h : 20037508.34 * 2,
        node : K.quadtree.frontendNode
    });
    
    var openDialog = function(dialog, w, h) {
        dialog.dialog('open');
        dialog.dialog('option', 'width',  w * 0.8);
        dialog.dialog('option', 'height', h * 0.8);
        dialog.dialog('option', 'position', [w * 0.1, h * 0.1]);    
    };

    var methods = {
        init : function() {
            var map = new OpenLayers.Map({
                div : this[0],
                eventListeners : {
                    moveend : function() {
                        var extent = map.getExtent();
                        K.chat.emit("ignore", null, function() {
                            tree.prepare({
                                x : extent.left,
                                y : extent.bottom,
                                w : extent.right - extent.left,
                                h : extent.top - extent.bottom
                            }, function(depth, position, timestamp) {
                                K.chat.emit("watch", {
                                    depth : depth,
                                    position : position,
                                    timestamp : timestamp
                                }, function(status) {
                                    if (status === 'error') console.log('db error, needs handling');
                                }); 
                            });
                        });
                    }
                }
            });
            map.addLayer(new OpenLayers.Layer.OSM());
 
            var lonLat = new OpenLayers.LonLat(1495588,6888577);
 
            var markers = new OpenLayers.Layer.Markers( "Markers" );
            var element = $(this);
            var dialog = element.find('.kwarque-map-popup').dialog({
                autoOpen : false
            });
            var input = element.find('.kwarque-map-input').dialog({
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
                    element.css('cursor', 'default');
                }
            });
            var button = element.find('.kwarque-map-add');
            button.button().click(function() {
                element.css('cursor', 'crosshair');
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
            K.chat.on("fragment", function(item) {
                item.h = item.h || 0;
                item.w = item.w || 0;
                tree.update(item);
                self.kwarqueMap('addMarker', item);
            });
            var data = this.data("kwarqueMap");
            
            data.input.find('form').submit(function(e) {
                e.preventDefault();
                var el = $(this);
                var content = {
                    type : "fragment",
                    time : el.find('.kwarque-map-input-time').val(),
                    x : el.find('.kwarque-map-input-lon').val(),
                    y : el.find('.kwarque-map-input-lat').val(),
                    title : el.find('.kwarque-map-input-title').val(),
                    text : el.find('.kwarque-map-input-text').val()
                };
                K.chat.emit("insert", content, function(result, id) {
                    if (result === 'end') {
                        content.id = id;
                        content.owner = K.chat.getNick();
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
                data.dialog.find('.kwarque-map-popup-time').text(K.date.format(new Date(this.data.time * 1000)));
                data.dialog.find('.kwarque-map-popup-owner').text(this.data.owner);
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