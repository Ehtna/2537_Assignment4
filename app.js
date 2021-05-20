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

app.use(session(
    {
        secret:'the secret text is the friends along the way',
        name:'DinoCopSessionID',
        resave: false,
        saveUninitialized: true }
));

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

    //initDB();

    res.set('Server', 'Wazubi Engine');
    res.set('X-Powered-By', 'My strong arms');
    res.send(dom.serialize());
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.post('/login', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    req.session.loggedIn = true;
    req.session.userName = req.body.userName;
    req.session.save(function(err) {
        // session saved
    res.send({ status: "success", msg: "Logged in." });
    })

});

// Not currently used
app.post('/authenticate', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let results = authenticate(req.body.username,
        function (rows) {
            if (rows == null) {
                res.send({ status: "fail", msg: "User account not found." });
            } 
                // authenticate the user, create a session
                req.session.loggedIn = true;
                //req.session.username = rows.username;
                req.session.save(function (err) {
                })
                res.send({ status: "success", msg: "Logged in." });
        });
});
// Not currently used
function authenticate(username, callback) {

    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'assignment4'
    });

    connection.query(
        "SELECT * FROM user WHERE username = ?", [username],
        function (error, results) {
            if (error) {
                throw error;
            }

            if (results.length > 0) {
                // email and password found
                return callback(results[0]);
            } else {
                // user not found
                return callback(null);
            }

        });

}
// Not currently used
async function initDB() {
   
    // Let's build the DB if it doesn't exist
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      multipleStatements: true
    });

    const createDBAndTables = `CREATE DATABASE IF NOT EXISTS assignment4;
        use assignment4;
        CREATE TABLE IF NOT EXISTS user (
        username varchar(30),
        PRIMARY KEY (username));`;

    await connection.query(createDBAndTables);

    connection.end();
}

app.get('/getUserName', function(req, res) {

    res.send({ status: "success", user: req.session.userName, msg: "Logged in." });

});

// Everything below is socket.io other than server
var userCount = 0;

io.on('connect', function(socket) {
    userCount++;
    // session.userName undefined, bug
    socket.userName = session.userName;
    io.emit('user_joined', { user: socket.userName, numOfUsers: userCount });
    console.log('Connected users:', userCount);

    socket.on('disconnect', function(data) {
        userCount--;
        io.emit('user_left', { user: socket.userName, numOfUsers: userCount });

        console.log('Connected users:', userCount);
    });

    socket.on('chatting', function(data) {

        console.log('User', data.name, 'Message', data.message);

        // if you don't want to send to the sender
        //socket.broadcast.emit({user: data.name, text: data.message});

        io.emit("chatting", {user: socket.userName, text: data.message});

    });

});

app.get('/landing', function(req, res) {
        let templateFile = fs.readFileSync('./static/html/landing.html', "utf8");
        res.send(templateFile);
}); 

app.get('/logout', function(req,res){
    req.session.destroy(function(error){
        if(error) {
            console.log(error);
        }
    });
    res.redirect("/landing");
})

// Run server
let port = 8000;
server.listen(port, function () {
    console.log("I love your face on port " + port);
});