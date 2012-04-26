"use strict";
(function (K, io) {
    var socket = io.connect();
    var nick = null;
    var rooms = [];
    var roomCallbacks = {};
    var globalCallbacks = {};
    K.chat = {};

    K.chat.emit = function(event, data, callback) {
        socket.emit(event, data, callback);
    }

    K.chat.on = function (event, callback) {
        socket.on(event, callback);
        if (typeof globalCallbacks[event] === "undefined") {
            globalCallbacks[event] = [callback];
        } else {
            globalCallbacks[event].push(callback);
        }
    };

    K.chat.onRoom = function (event, room, callback) {
        if (typeof roomCallbacks[event] === "undefined") {
            roomCallbacks[event] = {};
            roomCallbacks[event][room] = [callback];
            K.chat.on(event, function (msg) {
                for (var room in roomCallbacks[event]) {
                    if (room === msg.room && roomCallbacks[event].hasOwnProperty(room)) {
                        roomCallbacks[event][room](msg);
                    }
                }
            });
        } else if (typeof roomCallbacks[event][room] === "undefined") {
            roomCallbacks[event][room] = [callback];
        } else {
            roomCallbacks[event][room].push(callback);
        }
    };

    K.chat.authenticate = function (newNick, password, callback) {
        nick = newNick;
        socket.emit('authenticate', {
            nick : nick,
            password : password,
            room : null
        }, function (response) {
            callback(response);
        });
    };

    K.chat.join = function (room, callback) {
        socket.emit('join', {
            room: room,
            nick: nick
        }, function (response) {
            rooms.push(room);
            callback(response);
        });
    };

    K.chat.leave = function (room, callback) {
        var index = rooms.indexOf(room);
        if (index !== - 1) {
            socket.emit('leave', {
                room: room,
                nick: nick
            }, function (response) {
                rooms.splice(index, 1);
                callback(response);
            });
        }
    };

    K.chat.send = function (msg, room, callback) {
        socket.emit("message", {
            msg: msg,
            nick: nick,
            room: room
        }, function (response) {
            callback(response);
        });
    };
})(KWARQUE, io);

