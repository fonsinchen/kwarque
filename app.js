var express = require("express"),
    app = express.createServer();
    
app.get("/", function(req, res) {
  res.redirect("/index.html");
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

const redis = require('redis');
const client = redis.createClient();

var io = require('socket.io').listen(app);

app.listen(3000);

io.of('/chat').on('connection', function (socket) {
	  socket.on('message', function (data) {
		console.log(data);
	    socket.broadcast.emit('message', data);
	  });
});




