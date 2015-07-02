var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	usernames = [];

server.listen(process.env.PORT || 3000);

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});
//Everything I do with socket has to go in this function
io.sockets.on('connection', function (socket) {
	socket.on('newuser', function (data, callback) {
		if (usernames.indexOf(data) != -1) { //if the username is already taken
			callback(false);
		} else {
			callback(true);
			socket.username = data;
			usernames.push(socket.username);
			updateUsernames();
		}
	});
	//update the username function
	function updateUsernames () {
		io.sockets.emit('usernames', usernames);
	}

	//send message
	socket.on('sendmessage', function (data) {
		io.sockets.emit('newmessage',{msg: data, user: socket.username});
	})

	//Disconnect
	socket.on('disconnect', function (data) {
		if(!socket.username) {
			return; 
		} else {
			usernames.splice(usernames.indexOf(socket.username), 1);
			updateUsernames();
		}
	})
});