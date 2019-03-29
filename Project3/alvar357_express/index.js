// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT

// include the express module
var express = require("express");

// create an express application
var app = express();

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser');

// fs module - provides an API for interacting with the file system
var fs = require("fs");

// helps in managing user sessions
var session = require('express-session');

// native js function for hashing messages with the SHA-1 algorithm
var sha1 = require('sha1');

// include the mysql module
var mysql = require("mysql");

// apply the body-parser middleware to all incoming requests
app.use(bodyparser());

// use express-session
// in mremory session is sufficient for this assignment
app.use(session({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  resave: false}
));

// server listens on port 9007 for incoming connections
app.listen(9007, () => console.log('Listening on port 9007!'));

// GET method route for the favourites page.
// It serves favourites.html present in client folder
app.get('/favourites',function(req, res) {
  if (req.session.value != 1) {
    req.session.value = null;
    res.redirect("/login");
  } else {
    res.sendFile(__dirname + "/client/favourites.html");
  }
});

// GET method route for the addPlace page.
// It serves addPlace.html present in client folder
app.get('/addPlace',function(req, res) {
   if (req.session.value != 1) {
     req.session.value = null;
     res.redirect("/login");
   } else {
     res.sendFile(__dirname + "/client/addPlace.html");
   }
});

// GET method route for the login page.
// It serves login.html present in client folder
app.get('/login',function(req, res) {
  if (req.session.value != -1) {
    req.session.value = null;
  }
  res.sendFile(__dirname + '/client/login.html');
});

// GET method to return the list of favourite places
// The function queries the table tbl_places for the list of places and sends the response back to client
// However, if login credentials are wrong, error message is displayed
app.get('/getListOfFavPlaces', function(req, res) {
  if (req.session.value == -1) {
    res.send("Error");
  } else {
    var con = mysql.createConnection({
      host: "cse-curly.cse.umn.edu",
      user: "C4131S18U5",
      password: "10",
      database: "C4131S18U5",
      port: 3306
    });
    con.connect(function(err) {
      if (err) {
        throw err;
      };
    });
    con.query('SELECT * FROM tbl_places', function(err,rows,fields) {
    	if (err) throw err;
      if (rows.length == 0)
        console.log("No entries in places table");
      else {
        var response = {res: rows};
        res.send(response); // send back response with places list to client
      }
    });
  }
});

// POST method to insert details of a new place to tbl_places table
app.post('/postPlace', function(req, res) {
  var post = req.body;
  var placename = post.place_name;
  var addressline1 = post.addr_line1;
  var addressline2 = post.addr_line2;
  var opentime = post.open_time;
  var closetime = post.close_time;
  var additionalinfo = post.add_info;
  var additionalinfourl = post.add_info_url;
  var con = mysql.createConnection({
    host: "cse-curly.cse.umn.edu",
    user: "C4131S18U5",
    password: "10",
    database: "C4131S18U5",
    port: 3306
  });
  con.connect(function(err) {
    if (err) {
      throw err;
    };
  });
  var rowToBeInserted = {
    place_name : placename,
    addr_line1 : addressline1,
    addr_line2 : addressline2,
    open_time : opentime,
    close_time : closetime,
    add_info : additionalinfo,
    add_info_url : additionalinfourl
  };
  con.query('INSERT tbl_places SET ?', rowToBeInserted, function(err, result) {
    if (err) throw err;
    res.redirect("/favourites");
  });
});

// POST method to validate user login
// upon successful login, user session is created
app.post('/validateLoginDetails', function(req, res) {
  if ((req.body.user == "foo") && (sha1(req.body.password) == "62cdb7020ff920e5aa642c3d4066950dd1f01f4d")) {
  	req.session.value = 1;
    res.redirect("/favourites");
  } else {
    req.session.value = -1;
    res.redirect("/login");
  }
});

// log out of the application
// destroy user session
app.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect("/login");
});

// middle ware to server static files
app.use('/client', express.static(__dirname + '/client'));

// function to return the 404 message and error to client
app.get('*', function(req, res) {
  res.send("The requested page was not found", 404);
});
