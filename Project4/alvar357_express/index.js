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

// include the xml2js module
var xml2js = require("xml2js");

var parser = new xml2js.Parser();
var theinfo;
var id; // id of user being updated
var new_admin_name; // name of user being updated/added
var new_admin_login; // login of user being updated/login
var new_admin_password; // password of user being updated/login



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
app.listen(9357, () => console.log('Listening on port 9357!'));

// read in database configuration from xml file
fs.readFile(__dirname + '/dbconfig.xml', function(err, data) {
	if (err) throw err;
  parser.parseString(data, function (err, result) {
    if (err) throw err;
    theinfo = result;
  });
});

// GET method route for the favourites page.
// It serves favourites.html present in client folder
app.get('/favourites',function(req, res) {
  if (!req.session.value) {
    res.redirect("/login");
  } else {
    res.sendFile(__dirname + "/client/favourites.html");
  }
});

// GET method route for the addPlace page.
// It serves addPlace.html present in client folder
app.get('/addPlace',function(req, res) {
   //if (req.session.value != 1) {
     //req.session.value = null;
  if (!req.session.value) {
     res.redirect("/login");
   } else {
     res.sendFile(__dirname + "/client/addPlace.html");
   }
});

// GET method route for the admin page.
// It serves admin.html present in client folder
app.get('/admin',function(req, res) {
   if (!req.session.value) {
     res.redirect("/login");
   } else {
     res.sendFile(__dirname + "/client/admin.html");
   }
});

// GET method route for the login page.
// It serves login.html present in client folder
app.get('/login',function(req, res) {
  //if (req.session.value != -1) {
    //req.session.value = null;
  //}
  res.sendFile(__dirname + '/client/login.html');
});

// GET method to return the list of favourite places
// The function queries the table tbl_places for the list of places and sends the response back to client
// However, if login credentials are wrong, error message is displayed
app.get('/getListOfFavPlaces', function(req, res) {
  if (req.session.value == -1) {
    req.session.value = null;
    res.send("Error");
  } else {
    var con = mysql.createConnection({
      host: theinfo.dbconfig.host[0],
      user: theinfo.dbconfig.user[0],
      password: theinfo.dbconfig.password[0],
      database: theinfo.dbconfig.database[0],
      port: theinfo.dbconfig.port[0]
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

// GET method to return the list of admins
// The function queries the table tbl_accounts for the list of admins and sends the response back to client
// However, if login credentials are wrong, error message is displayed
app.get('/getListOfAdmins', function(req, res) {
  var con = mysql.createConnection({
    host: theinfo.dbconfig.host[0],
    user: theinfo.dbconfig.user[0],
    password: theinfo.dbconfig.password[0],
    database: theinfo.dbconfig.database[0],
    port: theinfo.dbconfig.port[0]
  });
  con.connect(function(err) {
    if (err) {
      throw err;
    };
  });
  con.query('SELECT * FROM tbl_accounts', function(err,rows,fields) {
  	if (err) throw err;
    if (rows.length == 0)
      console.log("No entries in accounts table");
    else {
      var response = [req.session.value, {res:rows}, new_admin_name, new_admin_login, new_admin_password, id];
      res.send(response); // send back response with places list to client
    }
  });
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
    host: theinfo.dbconfig.host[0],
    user: theinfo.dbconfig.user[0],
    password: theinfo.dbconfig.password[0],
    database: theinfo.dbconfig.database[0],
    port: theinfo.dbconfig.port[0]
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

// Delete method disguised as POST to remove user with given login in hidden form field
app.post('/deleteAdmin', function(req, res) {
  var login_to_delete = req.body.login_to_delete;
  if (login_to_delete == "foo") { // can't delete user currently logged in
    req.session.value = -4;
  } else {
    req.session.value = 1;
    var con = mysql.createConnection({
      host: theinfo.dbconfig.host[0],
      user: theinfo.dbconfig.user[0],
      password: theinfo.dbconfig.password[0],
      database: theinfo.dbconfig.database[0],
      port: theinfo.dbconfig.port[0]
    });
    con.connect(function(err) {
      if (err) {
        throw err;
      };
    });
    con.query('DELETE from tbl_accounts where acc_login = ?', login_to_delete, function(err, result) {
      if (err) throw err;
    });
  }
  res.redirect("/admin");
});

// POST method that validates the login being updated or added and updates the table accordingly
app.post('/postAdmin', function(req, res) {
  new_admin_name = req.body.admin_name;
  new_admin_login = req.body.admin_login;
  new_admin_password = req.body.admin_password;
  id = req.body.id;
  var match = false;

  var con = mysql.createConnection({
    host: theinfo.dbconfig.host[0],
    user: theinfo.dbconfig.user[0],
    password: theinfo.dbconfig.password[0],
    database: theinfo.dbconfig.database[0],
    port: theinfo.dbconfig.port[0]
  });
  con.connect(function(err) {
    if (err) {
      throw err;
    };
  });
  con.query('SELECT * FROM tbl_accounts', function(err,rows,fields) {
    if (err) throw err;
    if (rows.length == 0)
      console.log("No entries in accounts table");
    else {
      var count = 0;
      while (count < rows.length) {
        if (rows[count].acc_login == new_admin_login && id != rows[count].acc_id) {
          match = true;
          break;
        }
        count ++;
      }
      if (req.body.login_to_delete) { // post method is actually a delete request
        var login_to_delete = req.body.login_to_delete;
        if (login_to_delete == "foo") {
          req.session.value = -4; // can't delete user currently logged in
        } else {
          req.session.value = 1; // can delete
          con.query('DELETE from tbl_accounts where acc_login = ?', login_to_delete, function(err, result) {
            if (err) throw err;
          });
        }
      } else {
        if (match) { // Updated/added login already exists. Display appropirate error messages
          if (id) { // EDIT mode
            req.session.value = -3; //
          } else { // ADD mode
            req.session.value = -2;
          }
        } else { // can proceed with updating/deleted the user with given login
          req.session.value = 1;
          if (id) { // EDIT mode - updating the user
            var sql = "UPDATE tbl_accounts SET acc_name='" + new_admin_name + "',acc_login='" + new_admin_login + "'," + "acc_password='" + new_admin_password + "' WHERE acc_id=" + id;
            con.query(sql, function(err, result) {
              if (err) throw err;
            });
          } else { // ADD mode - inserting a completely new user into table
            var rowToBeInserted = {
              acc_name : new_admin_name,
              acc_login : new_admin_login,
              acc_password : new_admin_password
            };
            con.query('INSERT tbl_accounts SET ?', rowToBeInserted, function(err, result) {
              if (err) throw err;
            });
          }
        }
      }
      res.redirect("/admin");
    }
  });
});

// log out of the application
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
