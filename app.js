"use strict";
const express = require('express');
const app = express();
const morgan = require('morgan');
const server = require('http').Server(app);
const path = require('path');
const rfs = require('rotating-file-stream');
const fs = require("fs");
const io = require('socket.io')(server);
const session = require("express-session");
const { JSDOM } = require('jsdom');
const mysql = require('mysql2');

app.use("/script", express.static("static/script"));
app.use("/html", express.static("static/html"));
app.use("/css", express.static("static/css"));
app.use("/img", express.static("static/img"));
app.use("/fonts", express.static("static/fonts"));

const sessionMiddleware = session({
    secret:'the secret text is the friends along the way',
    name:'DinoCopSessionID',
    resave: false,
    saveUninitialized: true }
);

// Middleware so that socket.io can interact with sessions
app.use(sessionMiddleware);
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: path.join(__dirname, 'log')
  });
  
  app.use(morgan(':referrer :url :user-agent',
                 { stream: accessLogStream }));

app.get('/', function (req, res) {
    let doc = fs.readFileSync('./static/html/index.html', "utf8");
    let dom = new JSDOM(doc);
    let $ = require("jquery")(dom.window);
    // Function to make DB if it doesnt exist
    initDB();

    res.set('Server', 'Dinoserver mk3.xx');
    res.set('X-Powered-By', 'Students suffering');
    res.send(dom.serialize());
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Login and create session
app.post('/login', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    req.session.loggedIn = true;
    req.session.userName = req.body.userName;
    req.session.save(function(err) {
        // session saved
    res.send({ status: "success", msg: "Logged in." });
    })

});
// Logout and redirect to index
app.get('/logout', function(req,res){
    req.session.destroy(function(error){
        if(error) {
            console.log(error);
        }
    });
    res.redirect("/");
})

// Creates database if it doesn't already exist
async function initDB() {
   
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      multipleStatements: true
    });
    // Database chatarena table chathistory
    const createDBAndTables = `CREATE DATABASE IF NOT EXISTS chatarena;
        use chatarena;
        CREATE TABLE IF NOT EXISTS chathistory (
        ID int NOT NULL AUTO_INCREMENT,
        msg varchar(500),
        PRIMARY KEY (ID));`;

    connection.query(createDBAndTables);

    connection.end();
}

// Returns session username
app.get('/getUserName', function(req, res) {
    res.send({ status: "success", user: req.session.userName, msg: "Logged in." });
});

// Returns all chat history
app.get('/getChatHistory', function(req, res) {

    let connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "chatarena"
    });
    connection.connect();

    connection.query("SELECT * FROM chathistory", function (error, results) {
        if (error) {
            throw error;
        }
        res.send({ msg: "success", rows: results });
    });

    connection.end();

});



// Changes :) to ☺
function changeToEmoji(message) {   
    let messageWithEmoji = message.replace(":)","☺")
    return messageWithEmoji;
}

// Saves user chatlogs to the database
function logChat(chat) {
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'chatarena'
    });
    connection.connect();
    connection.query('INSERT INTO chathistory (msg) values (?)', [chat]);
    connection.end();
}

// Number of users connected to server
var userCount = 0;
// socket.io functionality
io.on('connect', function(socket) {
    const session = socket.request.session;
    userCount++;
    
    socket.userName = session.userName;
    let connectMsg;
    if (userCount == 1) {
        connectMsg = "<p class='color0'>" + socket.userName + " connected. They stand alone in the arena.</p>";
    } else {
        connectMsg = "<p class='color0'>" + socket.userName + " connected. There are " + userCount + " combatants in the arena</p>";
    }
    logChat(connectMsg);
    io.emit('user_joined', { user: socket.userName, numOfUsers: userCount });
    console.log('Connected users:', userCount);

    socket.on('disconnect', function(data) {
        userCount--;
        let disconnectMsg;
        if (userCount == 0){
            disconnectMsg = "<p class='color0'>" + socket.userName + " disconnected. The arena is empty.</p>";
        } else if (userCount == 1) {
            disconnectMsg = "<p class='color0'>" + socket.userName + " disconnected. There is " + userCount + " combatants in the arena</p>";
        } else {
            disconnectMsg = "<p class='color0'>" + socket.userName + " disconnected. There are " + userCount + " combatants in the arena</p>";
        }
        logChat(disconnectMsg);
        io.emit('user_left', { user: socket.userName, numOfUsers: userCount });
        console.log('Connected users:', userCount);
    });

    socket.on('chatting', function(data) {
        // Calls function to replace :) with emoji
        let message = changeToEmoji(data.message);
        // Saves user chat messages messages
        let chatlog = "<p class ='" + data.font + " " + data.color + "'>";
        chatlog += socket.userName + " said: " + message + "</p>";
        logChat(chatlog);
        io.emit("chatting", {user: socket.userName, text: message, font: data.font, color: data.color});

    });

});

// Run server
let port = 8000;
server.listen(port, function () {
    console.log("Tonight we fight on port " + port);
});