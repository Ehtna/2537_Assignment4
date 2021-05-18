const express = require('express');
const app = express();
const morgan = require('morgan');
const mysql = require('mysql');
const server = require('http').Server(app);

const io = require('socket.io')(server);
const fs = require("fs");
const { JSDOM } = require('jsdom');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.use("/scripts", express.static("static/scripts"));
app.use("/css", express.static("static/css"));
app.use("/img", express.static("static/img"));

app.use(session(
    {
        secret:'extra text that no one will guess',
        name:'wazaSessionID',
        resave: false,
        saveUninitialized: true }));

app.get("/", function (req, res) {

    //Create the database if it doesn't already exist
    initDB();

    let index = fs.readFileSync("./static/html/index.html", "utf8");
    res.send(index);
});


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
        ID int NOT NULL AUTO_INCREMENT,
        email varchar(30),
        password varchar(30),
        PRIMARY KEY (ID));`;

    await connection.query(createDBAndTables);
    let results = await connection.query("SELECT COUNT(*) FROM user");
    let count = results[0][0]['COUNT(*)'];

    if(count < 1) {
        results = await connection.query("INSERT INTO user (email, password) values ('arron_ferguson@bcit.ca', 'admin')");
        console.log("Added one user record.");
    }
    connection.end();
}

app.get('/landing', function(req, res) {

    // check for a session first!


        // DIY templating with DOM, this is only the husk of the page
        let templateFile = fs.readFileSync('./static/html/landing.html', "utf8");
        res.send(templateFile);

}); 





// Notice that this is a 'POST'
app.post('/authenticate', function(req, res) {


});





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
    console.log("Nolan has been voted off port " + port);
});