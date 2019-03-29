"use strict";

(function() {
	// the API end point
	var url = "getListOfFavPlaces";
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
})();
