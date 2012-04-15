"use strict";

var express = require("express");
var app = express.createServer();

app.get("/", function (req, res) {
	res.sendfile(__dirname + "/public/index.html");
});

app.configure(function () {
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
	app.use(app.router);
});

var io = require('socket.io').listen(app);
var redis = require('socket.io/node_modules/redis');

io.configure(function () {
	var RedisStore = require('socket.io/lib/stores/redis');
	io.set('store', new RedisStore({
		redisPub: redis.createClient(),
		redisSub: redis.createClient(),
		redisClient: redis.createClient()
	}));
});

app.listen(8000);

io.sockets.on('connection', function (client) {
	var i = 0;
	client.rooms = [];
	client.nick = "";

	client.on("authenticate", function (nick, fn) {
		client.nick = nick;
		fn({
			msg: "Hello " + nick,
			nick: "Server",
			room: "~" + nick
		});
	});

	client.on("join", function (room, fn) {
		client.rooms.push(room);
		client.join(room);
		fn({
			msg: "Welcome to " + room
		});
		client.broadcast.to(room).json.send({
			msg: client.nick + " joined " + room,
			nick: "Server",
			room: room
		});
	});

	client.on('message', function (message, fn) {
		console.log("message: " + message.msg);
		client.broadcast.to(message.room).json.send(message);
		fn(message);
	});

	client.on('disconnect', function () {
		for (i = 0; i < client.rooms.length; ++i) {
			client.broadcast.to(client.rooms[i]).json.send({
				msg: client.nick + " has disconnected",
				nick: "Server",
				room: client.rooms[i]
			});
		}
	});
});

