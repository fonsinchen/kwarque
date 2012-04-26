"use strict";

(function (K) {
    var db = require('pg');
    var config = {
        host : '/var/run/postgresql',
        database : 'kwarque'
    };
    //or native libpq bindings
    //var pg = require('pg').native

    //error handling omitted
    K.db = {
        getFragments : function(timestamp, area, fn) {
            db.connect(config, function(err, client) {
                client.query("SELECT location[0] AS lon, location[1] AS lat, title, text FROM fragment", function(err, result) {
                    fn(result);
                });
            });
        },
        
        insertFragment : function(data, fn) {
            db.connect(config, function(err, client) {
                client.query({
                    name : 'insert fragment',
                    text : "INSERT INTO fragment (location, title, text) VALUES (POINT($1, $2), $3, $4)",
                    values : [data.lon, data.lat, data.title, data.text]
                }, fn);
            })
        },

        serve : function(client) {
            /**
             * watch an area on the map.
             */
            client.on("watch", function(select, fn) {
                K.db.getFragments(select.timestamp, select.area, function(result) {
                    fn(result);
                });
            });
            /**
             * ignore an area on the map
             */
            client.on("ignore", function(select, fn) {
                
            });
            
            client.on("insert", function(data, fn) {
                K.db.insertFragment(data, fn);
            });
        }
    }
})(process.KWARQUE);