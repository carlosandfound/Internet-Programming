<?php
// include databse file
include_once 'database.php';

// Create connection
$conn=new mysqli($db_host,$db_username,$db_password,$db_name);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$validated; // keep track if correct login information is inputte

// get login details submitted by user trying to log in
$form_user = $_POST['user'];
$form_pass = $_POST['password'];

$sql = "SELECT acc_login, acc_password FROM tbl_accounts";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    if ($row["acc_login"] == $form_user && $row["acc_password"] == sha1($form_pass)) {
      $validated = $row["acc_login"];
      break;
    }
  }
}

session_start();

if ($validated) {
  $_SESSION['user'] = $validated;
  $conn->close();
  header("Location:favplaces.php");
} else {
  $conn->close();
  session_destroy();
}
?>

<!doctype html>
<html lang="en">
<title>Login</title>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
      <link rel="stylesheet" type="text/css" href="style.css"/>
      <title>Login Page</title>
  </head>

  <body>
    <div class="jumbotron">
      <h1>Login Page</h1>
      <p>Please enter your user name and password. Both are case sensitive.</p>
    </div>

    <div class="container">

      <form method="post" action="login.php">
        <div class="form-group">
          <label>User:</label>
          <input type="text" class="form-control" placeholder="Enter user name" name="user">
        </div>
        <div class="form-group">
          <label>Password:</label>
          <input type="password" class="form-control" placeholder="Enter password" name="password">
        </div>
        <button type="submit" class="btn btn-primary btn-block" value="Submit">Submit</button>
      </form>

    </div>
  </body>

</html>
