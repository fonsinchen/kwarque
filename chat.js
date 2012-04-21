"use strict";

(function (K) {
    var io = require('socket.io').listen(K.app);
    var redis = require('socket.io/node_modules/redis');

    io.configure(function () {
        var RedisStore = require('socket.io/lib/stores/redis');
        io.set('store', new RedisStore({
            redisPub: redis.createClient(),
            redisSub: redis.createClient(),
            redisClient: redis.createClient()
        }));
    });

    io.sockets.on('connection', function (client) {
        var i = 0;
        client.rooms = [];
        client.nick = "";

        client.on("authenticate", function (login, fn) {
            client.nick = login.nick;
            fn({
                msg: "Hello " + login.nick,
                nick: "kwarque",
                room: "~" + login.nick
            });
        });

        client.on("join", function (msg, fn) {
            client.rooms.push(msg.room);
            client.join(msg.room);
            fn({
                msg: "Welcome to " + msg.room,
                nick: "kwarque",
                room: msg.room
            });
            client.broadcast.to(msg.room).json.emit('clientJoined', {
                nick: client.nick,
                room: msg.room
            });
        });

        client.on('leave', function (msg, fn) {
            var index = client.rooms.indexOf(msg.room);
            if (index !== -1) {
                client.rooms.splice(index, 1);
                client.leave(msg.room);
                client.broadcast.to(msg.room).json.emit('clientLeft', {
                    nick: client.nick,
                    room: msg.room
                });
            }
            fn({
                msg: "Goodbye",
                nick: "kwarque",
                room: msg.room
            });
        });

        client.on('message', function (msg, fn) {
            client.broadcast.to(msg.room).json.send(msg);
            fn(msg);
        });

        client.on('disconnect', function () {
            for (i = 0; i < client.rooms.length; ++i) {
                client.broadcast.to(client.rooms[i]).json.emit('clientLeft', {
                    nick: client.nick,
                    room: client.rooms[i]
                });
            }
        });
        K.db.serve(client);
    });
})(process.KWARQUE);