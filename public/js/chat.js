// socket.io specific code
var socket = io.connect('/chat');

socket.on('connect', function() {
	$('#chat').addClass('connected');
});

socket.on('message', message);
socket.on('reconnect', function() {
	$('#lines').remove();
	message('System', 'Reconnected to the server');
});

socket.on('reconnecting', function() {
	message('System', 'Attempting to re-connect to the server');
});

socket.on('error', function(e) {
	message('System', e ? e : 'A unknown error occurred');
});

function message(from, msg) {
	$('#lines').append($('<p>').append($('<b>').text(from), msg));
}

// dom manipulation
$(function() {
	$('#chat-input').submit(function() {
		message('me', $('#message').val());
		socket.emit('message', $('#message').val());
		clear();
		$('#lines').get(0).scrollTop = 10000000;
		return false;
	});

	function clear() {
		$('#message').val('').focus();
	}
});