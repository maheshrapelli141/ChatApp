const express = require('express');
const app = express();
const path = require("path");
var server = app.listen(8100)
var io = require('socket.io').listen(server);
var PORT = process.env.PORT || 8100;
// var http = require('http').Server(app); // this is a node server that uses express as the boiler plate
// var io = require('socket.io')(http); 
var fs = require('fs');


app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
var clients = {};

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {

  socket.on('add-user', function(data){
    clients[data.username] = {
      "socket": socket.id
    };
  });

  socket.on('private-message', function(data){
    console.log("Sending: " + data.content + " to " + data.username);
    if (clients[data.username]){
      io.sockets.connected[clients[data.username].socket].emit("add-message", data);
    } else {
      console.log("User does not exist: " + data.username); 
    }
  });

  //Removing the socket on disconnect
  socket.on('disconnect', function () {
    for (var name in clients) {
      if (clients[name].socket === socket.id) {
        delete clients[name];
        break;
      }
    }
  });

});

// app.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`);
// });
app.get('/', (req, res) => {
  res.render('index', { title: 'TEst' });
});