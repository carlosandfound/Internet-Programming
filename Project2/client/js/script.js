"use strict";

(function() {
	// the API end point
	var url = "getListOfFavPlaces";
	// ajax get method used to call getListOfFavPlaces an obtain the list of places
	$.get(url).done(function(response) {
		var places = response.res.placeList;
		var i;
		// iterate through places list and add each place to the table using jQuery
		for (i = 0; i < places.length; i++) {
			var output = '';
			output += '<tr>';
			output += '<td>' + places[i].placename + '</td>';
			output += '<td>' + places[i].addressline1 + places[i].addressline2 + '</td>';
			output += '<td>' + places[i].opentime + '<br>' + places[i].closetime + '</td>';
			output += '<td>' + places[i].additionalinfo + '</td>';
			output += '<td>' + places[i].additionalinfourl + '</td>';
			output += '</tr>';
			$('#myFavTable').append(output);
		}
	});
})();
