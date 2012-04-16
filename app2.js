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

	client.on("authenticate", function (login, fn) {
		client.nick = login.nick;
		fn({
			msg: "Hello " + login.nick,
			nick: "Server",
			room: "~" + login.nick
		});
	});

	client.on("join", function (msg, fn) {
		client.rooms.push(msg.room);
		client.join(msg.room);
		fn({
			msg: "Welcome to " + msg.room,
			nick: "Server",
			room: msg.room
		});
		client.broadcast.to(msg.room).json.send({
			msg: client.nick + " has joined " + msg.room,
			nick: "Server",
			room: msg.room
		});
	});

	client.on('leave', function (msg, fn) {
		var index = self.rooms.indexOf(msg.room);
		if (index !== - 1) {
			self.rooms.splice(index, 1);
			client.leave(msg.room);
			client.broadcast.to(msg.room).json.send({
				msg: client.nick + " left " + msg.room,
				nick: "Server",
				room: msg.room
			});
		}
        fn({
            msg: "Goodbye",
            nick: "Server",
            room: msg.room
        });
	});

	client.on('message', function (msg, fn) {
		client.broadcast.to(msg.room).json.send(msg);
		fn(msg);
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

