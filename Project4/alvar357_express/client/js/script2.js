"use strict";

(function() {
	// the API end point
	var url = "getListOfAdmins";
	// ajax get method used to call getListOfFavPlaces an obtain the list of places or display error message on login page
  // ajax get method used to call getListOfAdmins an obtain the list of admins or display error message on login page
	$.get(url).done(function(response, req) {
		if (response == "Error") {
			var error = "<br> <p style='color:red'>ERROR!<p> <br>";
			$('#badAdmin').append(error);
		} else {
			var rows = response.res;
			for (var i = 0 ; i < rows.length; i++) {
				var output = '';
				output += '<tr>';
				output += '<td>' + rows[i].acc_id + '</td>';
				output += '<td>' + rows[i].acc_name + '</td>';
				output += '<td>' + rows[i].acc_login + '</td>';
				output += '</tr>';
				$('#myAdminTable').append(output);
			}
		}
	});
})();
