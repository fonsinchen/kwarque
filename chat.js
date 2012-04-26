"use strict";

(function (K) {
    var io = require('socket.io').listen(K.app);
    
    /* remember nick of disconnecting clients */
    var disconnectingNick = null;
    var superDisconnect = io.onClientDisconnect;
    io.onClientDisconnect = function(id, reason) {
        var client = io.sockets.socket(id)
        disconnectingNick = client && client.nick;
        superDisconnect.apply(io, [id, reason]);
        disconnectingNick = null;
    };

    /* hook into onJoin and onLeave to generate messages for respective rooms */
    var overrideHandler = function (name, eventName) {
        var superHandler = io[name];
        io[name] = function(id, room) {
            superHandler.apply(io, [id, room]);
            room = room.split('/');
            room = room[room.length - 1];
            var client = io.sockets.socket(id)
            var nick = (client && client.nick) || disconnectingNick;
            if (room && nick) {
                io.sockets["in"](room).except(id).emit(eventName, {
                    nick: nick,
                    room: room
                });
            }
        }
    };
    overrideHandler('onJoin', 'clientJoined');
    overrideHandler('onLeave', 'clientLeft');

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
            client.join(msg.room);
            fn({
                msg: "Welcome to " + msg.room,
                nick: "kwarque",
                room: msg.room
            });
        });

        client.on('leave', function (msg, fn) {
            client.leave(msg.room);
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

        K.db.serve(client);
    });
})(process.KWARQUE);