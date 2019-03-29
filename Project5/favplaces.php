<?php
session_start();

// user not logged in
if (!isset($_SESSION['user'])) {
  session_destroy();
  header("Location:login.php");
}

// include databse file
include_once 'database.php';

// get values from form used to filter table
$form_pid = $_POST['place_id'];
$form_pname = $_POST['place_name'];
?>

<!doctype html>
<html lang="en">
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
      <link rel="stylesheet" type="text/css" href="style.css"/>
      <title>My favourite places</title>
  </head>

  <body>
      <nav class="navbar navbar-default">
        <div class="container-fluid">
          <ul class="nav navbar-nav">
            <li><a href="login.php"><b><span class = "top">Home</span></b></a></li>
            <li><a href="favplaces.php"><b><span class = "top">Favourite places</span></b></a></li>
            <li><a href="logout.php"><b><span class="glyphicon glyphicon-log-out"></span></b></a></li>
          </ul>
          <?php
          print("<ul class='nav navbar-nav navbar-right'><li><a><button class='btn btn-secondary' id='curr_user'>Welcome: " . $_SESSION['user'] . "</button></a></li></ul>");
          ?>
        </div>
      </nav>
      <div class="container">
        <h2>Favorite Places</h2>
        <br>
        <table class="table" id="myFavTable">
          <thead>
            <tr>
              <th scope="col">Id</th>
              <th scope="col">Name</th>
              <th scope="col">Address</th>
              <th scope="col">Open / Close</th>
              <th scope="col">Information</th>
              <th scope="col">URL</th>
            </tr>
          </thead>

            <?php
            // Create connection
            $conn=new mysqli($db_host,$db_username,$db_password,$db_name);

            if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
            }

            $sql;

            // check if any values were inputted to filter table
            if ($form_pid && $form_pname) {
            $sql = "SELECT * FROM tbl_places WHERE place_id=" . $form_pid . " AND place_name=" . "'" . $form_pname . "'";
          } else if ($form_pid) {
            $sql = "SELECT * FROM tbl_places WHERE place_id=" . $form_pid;
            } else if ($form_pname) {
            $sql = "SELECT * FROM tbl_places WHERE place_name=" . "'" . $form_pname . "'";
            } else {
            $sql = "SELECT * FROM tbl_places";
            }

            $result = $conn->query($sql);

            // fetch each row associated with query
            while ($row = mysqli_fetch_assoc($result)) {
            // build table to display results
            print("<tr>");

            $pid = $row["place_id"];
            $pname = $row["place_name"];
            $paddr = $row["addr_line1"] . " , " . $row["addr_line2"];
            $ptime = $row["open_time"] . " / " . $row["close_time"];
            $pinfo = $row["add_info"];
            $purl = $row["add_info_url"];
            print("<td>$pid</td>");
            print("<td>$pname</td>");
            print("<td>$paddr</td>");
            print("<td>$ptime</td>");
            print("<td>$pinfo</td>");
            print("<td>$purl</td>");

            print( "</tr>" );
            }

            $conn->close();
            ?>
        </table>

        <br> <br> <br> <br>

        <h2>Filter Criteria</h2>
        <br>
        <form method="post" action="favplaces.php">
          <div class="form-group">
            <label>Place Id:</label>
            <input type="number" class="form-control" placeholder="Enter place id" name="place_id">
          </div>
          <div class="form-group">
            <label>Place Name:</label>
            <input type="text" class="form-control" placeholder="Enter place name" name="place_name">
          </div>
          <button type="submit" class="btn btn-primary btn-block" value="Submit">Filter</button>
        </form>
      </div>
  </body>

</html>
