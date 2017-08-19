var express = require('express')  
, app = express()
, server = require('http').createServer(app)
, io = require("socket.io").listen(server)
//app.set('port', process.env.PORT || 3000);  
//app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");  
//... code to continue

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

server.listen(process.env.PORT || 3000, function(){
  console.log('listening');
});
