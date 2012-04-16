var chat = null;
$(document).ready(function () {
    function displayMessage (msg) {
        $('#board').append($(document.createElement('p')).text(msg.nick + ': ' + msg.msg));
    }
	$("#nick-space").submit(function (e) {
		e.preventDefault();
		$("#nick-space").hide();
		$("#chat-input").show();
        
		chat = new KwarqueChat;
        chat.on('message', displayMessage);
		chat.authenticate($("#nickname").val(), "", function (response) {
            displayMessage(response);
			chat.join($("#room").val(), function (response) {
                displayMessage(response);
            });
		});
	});

	$("#chat-input").submit(function (e) {
		e.preventDefault();
		var m = $("#message").val();
		$("#message").val("");
		chat.send(m, $("#room").val(), displayMessage);
	});
});

function KwarqueChat() {
	this.socket = io.connect();
	this.nick = null;
	this.rooms = [];
	this.roomCallbacks = {};
	this.globalCallbacks = {};
    var self = this;

	this.on = function (event, callback) {
		this.socket.on(event, callback);
		if (typeof this.globalCallbacks[event] === "undefined") {
			this.globalCallbacks[event] = [callback];
		} else {
			this.globalCallbacks[event].push(callback);
		}
	};

	this.onRoom = function (event, room, callback) {
		if (typeof this.roomCallbacks[event] === "undefined") {
			this.roomCallbacks[event] = {};
			this.roomCallbacks[event][room] = [callback];
			this.on(event, function (msg) {
				for (var room in self.roomCallbacks[event]) {
					if (room === msg.room && self.roomCallbacks[event].hasOwnProperty(room)) {
						self.roomCallbacks[event][room](msg);
					}
				}
			});
		} else if (typeof this.roomCallbacks[event][room] === "undefined") {
			this.roomCallbacks[event][room] = [callback];
		} else {
			this.roomCallbacks[event][room].push(callback);
		}
	};

	this.authenticate = function (nick, password, callback) {
		this.nick = nick;
        var doAuth = function () {
			self.socket.emit('authenticate', {
                nick : nick,
                password : password,
                room : null
            }, function (response) {
				callback(response);
			});
		};
        if (this.socket.connected) {
            doAuth();
        } else {
    		this.socket.on('connect', doAuth);
        }
	};

	this.join = function (room, callback) {
		this.socket.emit('join', {
			room: room,
			nick: self.nick,
		}, function (response) {
			self.rooms.push(room);
			callback(response);
		});
	};

	this.leave = function (room, callback) {
		var index = self.rooms.indexOf(room);
		if (index !== - 1) {
			this.socket.emit('leave', {
				room: room,
				nick: self.nick
			}, function (response) {
				self.rooms.splice(index, 1);
				callback(response);
			});
		}
	};

	this.send = function (msg, room, callback) {
		this.socket.emit("message", {
			msg: msg,
			nick: self.nick,
			room: room
		}, function (response) {
			callback(response);
		});
	};
}

