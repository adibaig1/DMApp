var express = require('express')
        , app = express()
        , server = require('http').createServer(app)
        , io = require("socket.io").listen(server)
var bodyParser = require('body-parser');

// use body parser to easy fetch post body
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())


// usernames which are currently connected to the chat
var usernames = {};

//name entered in homepage to be set in this global variable
var nick;

var msgHistory = ["NoMsg"]; //array to store history messages
var mh_index = 0;
var mh_size = 10; //size of message history

//////////////////////// All mapping for addresses and static resources ///////////////////
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/login', function (req, res) {
    //login controllers go here
    //trust me it will make sense in a few days
    //it already makes sense nigga ~nitrox
});

app.get('/lobby', function (req, res) {
    //lobby controllers may check session before the reponse header is sent
    res.sendFile(__dirname + '/views/lobby.html');
});

app.get('/decks', function (req, res) {
    res.sendFile(__dirname + '/views/decks.html');
});

app.get('/stats', function (req, res) {
    res.sendFile(__dirname + '/views/stats.html');
});

app.get('/duel', function (req, res) {
    res.sendFile(__dirname + '/views/duel.html');
});

app.use('/views', express.static(__dirname + '/views'));


////////////////////////////////////////Path mapping done////////////////////////////////////////

//route that receives the post body, saves the username and redirects to lobby
app.post('', function (req, res, next) {
    validateusername(req.body, res);
});

function validateusername(parms, res) {
    //get the parameters based on input name attribute from the html
    //and parse string to variable
    nick = parms.inputname;

    if (nick in usernames) {
        //this section is yet to be completed. If a username already is in use, an error message should be generated and redirected back to homepage
        return res.redirect('/');
    } else {
        //directing to lobby
        return res.redirect('/lobby');
    }
}

io.on('connection', function (socket) {

    // when the client emits 'adduser', this listens and executes
    socket.on('adduser', function (username) {
        if (nick in usernames) {//this block is for assigning usernames if user enters through lobby url directly i.e from prompt
            socket.username = username;
            usernames[username] = username;
        } else { //this block assigns username from home page
            // we store the username in the socket session for this client
            socket.username = nick;
            // add the client's username to the global list
            usernames[nick] = nick;
        }
        // update the list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);



        //console.log("\nHistory is:");  //for testing
        for (i = 0; i < msgHistory.length; i++)
        {
            var msg=msgHistory[(i + mh_index) % msgHistory.length]; //circular traversal from mh_index to the latest message
            //console.log(msg);  //for testing
            socket.emit('history message', msg);  //only for self, the user that just connected
        }  
        


        socket.emit('connect message');  //for self
        socket.broadcast.emit('connect message', socket.username); //for other users


        msgHistory[(mh_index++) % mh_size] = "*" + socket.username + " joined the chat.*";  //adding to message history, * signifies a connection or disconnection message  
        console.log('\nClient connected');

    });

    socket.on('disconnect', function () {
        // remove the username from global usernames list
        socket.broadcast.emit('chat message', {msg: socket.username + " left the chat", user: socket.username});


        delete usernames[socket.username];
        // update list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);

        msgHistory[(mh_index++) % mh_size] = "*" + socket.username + " left the chat*"; //recording disconnect to history, * means a connection or disconnection message
        console.log('\nClient disconnected');

        //socket.emit('chat message', 'You disconnected.');
    });


    socket.on('chat message', function (data) {
        io.emit('chat message', {msg: data, user: socket.username});
        msgHistory[(mh_index++) % mh_size] = socket.username + ": " + data;  //Recording chant message into history
    });
});
server.listen(process.env.PORT || 3000, function () {
    console.log('listening');
});
