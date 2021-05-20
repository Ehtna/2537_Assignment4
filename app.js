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

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.use("/script", express.static("static/script"));
app.use("/css", express.static("static/css"));
app.use("/img", express.static("static/img"));

app.use(session(
    {
        secret:'extra text that no one will guess',
        name:'wazaSessionID',
        resave: false,
        saveUninitialized: true }
));

app.get('/', function (req, res) {
    let doc = fs.readFileSync('./static/html/index.html', "utf8");

    let dom = new JSDOM(doc);
    let $ = require("jquery")(dom.window);

    initDB();

    res.set('Server', 'Wazubi Engine');
    res.set('X-Powered-By', 'My strong arms');
    res.send(dom.serialize());

});

/*
app.get("/", function (req, res) {

    let index = fs.readFileSync("./static/html/index.html", "utf8");
    res.send(index);
});
*/

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

app.get('/landing', function(req, res) {
        let templateFile = fs.readFileSync('./static/html/landing.html', "utf8");
        res.send(templateFile);
}); 

// No longer need body-parser!
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

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

app.get('/logout', function(req,res){
    req.session.destroy(function(error){
        if(error) {
            console.log(error);
        }
    });
    res.redirect("/landing");
})

let port = 8000;
app.listen(port, function () {
    console.log("I love your face on port " + port);
});