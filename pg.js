var pg = require('pg'); 
//or native libpq bindings
//var pg = require('pg').native

var config = {
    host : '/var/run/postgresql',
    database : 'kwarque'
}

//error handling omitted
pg.connect(config, function(err, client) {
    client.query("SELECT * FROM fragment", function(err, result) {
        for (var i = 0; i < result.rows.length; ++i) {
            console.log(result.rows[i]);
        }
    });
    client.query("SELECT NOW() as when", function(err, result) {
        console.log("Row count: %d",result.rows.length);  // 1
        console.log(result.rows[0]);
    });
});