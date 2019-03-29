"use strict";

var trash_icon = "<button id='delete_btn' type='submit'> <span class='glyphicon glyphicon-trash'></span> </button>";
var save_icon = "<button id='save_btn' type='submit' value='Submit'> <span class='glyphicon glyphicon-floppy-save'></span> </button>";
var original_name = ''; // keeps track of original name of user being updated
var original_login = ''; // keeps track of original login of user being updated
var original_password = ''; // keeps track of original password of user being updated
var original_buttons = ''; // keeps track of original buttons of user being updated
var mode;

(function() {
	// the API end point
	var url = "getListOfFavPlaces";
	var url2 = "getListOfAdmins";

	// ajax get method used to call getListOfFavPlaces an obtain the list of places or display error message on login page
	$.get(url).done(function(response, req) {
		if (response == "Error") {
			var error = "<br> <p style='color:red'>Invalid credentials. Please try again!<p> <br>";
			$('#badlogin').append(error);
		} else {
			var rows = response.res;
			for (var i = 0 ; i < rows.length; i++) {
				var output = '';
				output += '<tr>';
				output += '<td>' + rows[i].place_name + '</td>';
				output += '<td>' + rows[i].addr_line1 + rows[i].addr_line2 + '</td>';
				output += '<td>' + rows[i].open_time + '<br>' + rows[i].close_time + '</td>';
				output += '<td>' + rows[i].add_info + '</td>';
				output += '<td>' + rows[i].add_info_url + '</td>';
				output += '</tr>';
				$('#myFavTable').append(output);
			}
		}
	});
	// ajax get method used to call getListOfAdmins an obtain the list of admins or display error message on admin page
	$.get(url2).done(function(response, req) {
		if (response[0] == -2 || response[0] == -3) {
			var error = "<div id='badAdmin'> <br><p style='color:red'>This login is used by another user<p> <br><br><br> </div>";
			$('#ErrorSection').append(error);
		} else if (document.getElementById("badAdmin") != null) {
			var elem = document.getElementById("badAdmin");
			elem.parentNode.removeChild(elem);
		}

		if (response[0] == -4) {
			var error = "<div id='badDelete'> <br><p style='color:red'>Can not delete the user that is logged in<p> <br><br><br> </div>";
			$('#ErrorSection').append(error);
		} else if (document.getElementById("badDelete") != null) {
			var elem = document.getElementById("badDelete");
			elem.parentNode.removeChild(elem);
		}

		var rows = response[1].res;
		$('.container-fluid').append("<ul class='nav navbar-nav navbar-right'><li><a id='curr_user'>Welcome " + rows[0].acc_login + "</a></li></ul>");
		for (var i = 0 ; i < rows.length; i++) {
			var output = '';
			var row = i + 1;
			var edit_icon = "<button id='edit_btn' type='button' onclick='edit_row(" + row.toString() + ")'> <span class='glyphicon glyphicon-pencil'></span> </button>";
			output += '<tr>';
			output += "<td id='id_row" + row + "'>" + rows[i].acc_id + '</td>';

			if (response[0] == -3 && response[5] == rows[i].acc_id) { // failed to UPDATE THE USER
				mode = "EDIT";
				var cancel_icon = "<button id='cancel_btn' type='button' onclick='cancel(" + row + ")'> <span class='glyphicon glyphicon-remove'></span> </button>";
				output += "<td id='name_row" + row + "'><input type='text' name='admin_name' required maxlength='20' value=" + response[2] + "></td>";
				output += "<td id='login_row" + row + "'><input type='text' name='admin_login' required maxlength='20' value=" + response[3] + "></td>";
				output += "<td id='password_row" + row + "'><input type='text' name='admin_password' required maxlength='50' value=" + response[4] + "></td>";
				output += "<td id='buttons_row" + row + "'>" + save_icon + cancel_icon + "<input type='hidden' name='id' value=" + rows[i].acc_id + " ></td>";

				original_name = rows[i].acc_name;
				original_login = rows[i].acc_login;
				original_password = "<p id='hidden_password" + row + "' style='opacity:0'>" + rows[i].acc_password + '</p>';
				original_buttons = "<form method='post' action='/deleteAdmin'>" + edit_icon + trash_icon + "<input type='hidden' name='login_to_delete' value=" + rows[i].acc_login + ' />' + '</form>';
			} else {
				output += "<td id='name_row" + row + "'>" + rows[i].acc_name + '</td>';
				output += "<td id='login_row" + row + "'>" + rows[i].acc_login + '</td>';
				output += "<td id='password_row" + row + "'><p id='hidden_password" + row + "' style='opacity:0'>" + rows[i].acc_password + '</p></td>';
				output += "<td id='buttons_row" + row + "'><form method='post' action='/deleteAdmin'>" + edit_icon + trash_icon + "<input type='hidden' name='login_to_delete' value=" + rows[i].acc_login + ' /></form></td>';
			}
			output += '</tr>';
			$('#myAdminTable').append(output);
		}
		if (response[0] == -2) { // failed to ADD a new user
			mode = "ADD";
			var cancel_icon = "<button id='cancel_btn' type='button' onclick='cancel(" + rows.length+1 + ")'> <span class='glyphicon glyphicon-remove'></span> </button>";
			var current_row = '<tr>';
			current_row += '<td></td>';
			current_row += "<td> <input type='text' name='admin_name' required maxlength='20' value=" + response[2] + "> </td>";
			current_row += "<td> <input type='text' name='admin_login' required maxlength='20' value=" + response[3] + "> </td>";
			current_row += "<td> <input type='text' name='admin_password' required maxlength='50' value=" + response[4] + "> </td>";
			current_row += '<td>' + save_icon + cancel_icon + '</td>'
			current_row += '</tr>';
			$('#myAdminTable').append(current_row);
		}
	});
})();

$('#addUser').click(function() {
	// assume client inputs values for all field
	var index = document.getElementById("myAdminTable").rows.length + 1;
	var cancel_icon = "<button id='cancel_btn' type='button' onclick='cancel(" + index + ")'> <span class='glyphicon glyphicon-remove'></span> </button>";
	mode = "ADD";
	var newField = '<tr>';
	newField += '<td></td>';
	newField += "<td> <input type='text' name='admin_name' required maxlength='20'> </td>";
	newField += "<td> <input type='text' name='admin_login' required maxlength='20'> </td>";
	newField += "<td> <input type='text' name='admin_password' required maxlength='50'> </td>";
	newField += '<td>' + save_icon + cancel_icon + '</td>'
	newField += '</tr>';
	$('#myAdminTable').append(newField);
});

function edit_row(row) {
	mode = "EDIT";
	var id = document.getElementById("id_row"+row);
	var name = document.getElementById("name_row"+row);
	var login = document.getElementById("login_row"+row);
	var password = document.getElementById("password_row"+row);
	var buttons = document.getElementById("buttons_row"+row);

	var id_text = id.innerHTML;
	var name_text = name.innerHTML;
	var login_text = login.innerHTML;
	var password_text = document.getElementById("hidden_password"+row).innerHTML;
	var buttons_text = buttons.innerHTML;

	original_name = name_text;
	original_login = login_text;
	original_password = "<p id='hidden_password" + row + "' style='opacity:0'>" + password_text + "</p>";
	original_buttons = buttons_text;

	var cancel_icon = "<button id='cancel_btn' type='button' onclick='cancel(" + row + ")'> <span class='glyphicon glyphicon-remove'></span> </button>";

	name.innerHTML = "<input type='text' name='admin_name' required maxlength='20' value=" + name_text + ">";
	login.innerHTML = "<input type='text' name='admin_login' required maxlength='20' value=" + login_text + ">";
	password.innerHTML = "<input type='text' name='admin_password' required maxlength='50' value=" + password_text + ">";
	buttons.innerHTML = save_icon + cancel_icon + "<input type='hidden' name='id' value=" + id_text + " >"
};

// function to cancel the row currently being edited or added
function cancel(row) {
	var num_rows = document.getElementById("myAdminTable").rows.length;

	if (mode == "EDIT") {
		var name = document.getElementById("name_row"+row);
		var login = document.getElementById("login_row"+row);
		var password = document.getElementById("password_row"+row);
		var buttons = document.getElementById("buttons_row"+row);

		name.innerHTML = original_name;
		login.innerHTML = original_login;
		password.innerHTML = original_password;
		buttons.innerHTML = original_buttons;
	} else {
		var num_rows = document.getElementById("myAdminTable").rows.length;
		document.getElementById("myAdminTable").deleteRow(num_rows-1);
	}
	if (document.getElementById("badAdmin") != null) { // can remove error messages once you exit out of editing/adding
		var elem = document.getElementById("badAdmin");
		elem.parentNode.removeChild(elem);
	}
};
