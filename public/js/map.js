"use strict";

(function (K, $) {
    var methods = {
        init : function() {
            $(this).mapQuery({
                theme: "",
                layers:[{
                    type:'osm'
                },{
                    // TODO:
                    // make that a "vector" layer. Then we can "addFeatures"
                    // to it. Furthermore listen to the "moved" event of the
                    // OSM layer to determine if the map has moved and if we
                    // want to remove features or search for new ones.
                    type: 'JSON',
                    label: 'Polygons',
                    url: 'poly.json'
                }],
                center : {
                    position : [13.41,52.52], 
                    zoom : 15
                },
                projection: "EPSG:900913"
            });
        },
        
        popup : function() {
            $('#kwarque-map-popup').mqPopup({
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