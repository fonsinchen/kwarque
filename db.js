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
                    console.log(err);
                    fn(result);
                });
            });
        },

        serve : function(client) {
            client.on("data", function(select, fn) {
                K.db.getFragments(select.timestamp, select.area, function(result) {
                    fn(result);
                });
            });
        }
    }
})(process.KWARQUE);