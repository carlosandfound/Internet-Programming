<?php
	$xml=simplexml_load_file('dbconfig.xml') or
     die('Error: Cannot create object');

	$db_host = $xml->host;
	$db_username = $xml->user;
	$db_password = $xml->password;
	$db_name = $xml->database;
	$db_port = $xml->port;
?>
