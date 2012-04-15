var chat = null;
$(document).ready(function () {
	$("#nick-space").submit(function (e) {
		e.preventDefault();
		$("#nick-space").hide();
		$("#chat-input").show();
		chat = new Chat;
		chat.authenticate($("#nickname").val(), function () {
			chat.join($("#room").val(), function () {});
		});
	});

	$("#chat-input").submit(function (e) {
		e.preventDefault();
		sendMsg();
	});

	function sendMsg() {
		var m = $("#message").val();
		$("#message").val("");
		chat.send(m, $("#room").val(), function () {});
	}
});

function Chat() {
	this.socket = null;
	this.nickname = "";
	this.rooms = [];
	var self = this;

	this.authenticate = function (nick, callback) {
		this.socket = io.connect();
		this.nickname = nick;

		this.socket.on("message", function (msg, p, c) {
			$("#board").append("<p>" + msg.nick + ": " + msg.msg + "</p>");
		});

		this.socket.on('connect', function (data) {
			self.socket.emit('authenticate', nick, function (response) {
				$("#board").append("<p>" + response.msg + "</p>");
				callback();
			});
		});
	};

	this.join = function (room, callback) {
		this.socket.emit('join', room, function (response) {
			self.rooms.push(room);
			$("#board").append("<p>" + response.msg + "</p>");
			callback();
		});
	};

	this.send = function (msg, room, callback) {
		this.socket.emit("message", {
			msg: msg,
			nick: this.nickname,
			room: room
		},
		function (response) {
			$("#board").append("<p>" + self.nickname + ": " + msg + "</p>");
			callback();
		});
	};
}

