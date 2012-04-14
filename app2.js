//app.js Socket IO Test
var express = require("express"),
	app = express.createServer();

app.get("/", function(req, res) {
	res.sendfile(__dirname + "/public/index.html");
});

app.configure(function(){
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
	app.use(app.router);
});

var io = require('socket.io').listen(app)
var redis = require('socket.io/node_modules/redis');

io.configure( function(){
	var RedisStore = require('socket.io/lib/stores/redis');
	io.set('store', new RedisStore({
		redisPub: redis.createClient(),
		redisSub: redis.createClient(),
		redisClient: redis.createClient()
	}));
});


app.listen(8000);

io.sockets.on('connection', function(client){
	var Room = "";
    client.on("join", function(nick, fn){
    	Room = nick.room;
    	client.join(Room);
    	fn({msg : "Hello " + nick.nick + ", welcome to " + Room});
    	client.broadcast.to(Room).json.send({msg: nick + " joined " + Room});
    });

    client.on('message', function(message, fn){
        client.broadcast.to(Room).json.send(message);
        fn(message);
    });

    client.on('disconnect', function(){
    	client.broadcast.to(Room).json.send({msg: "Disconnected"});
    });
});