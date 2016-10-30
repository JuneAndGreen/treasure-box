$(document).ready(function() {
	$('#add').click(function() {
    location.href = '/add';
	});

	$('#back').click(function() {
    location.href = '/';
	});

  $('#logout').click(function() {
    location.href = '/api/logout';
  });
});