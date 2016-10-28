$(document).ready(function() {
	$('.j-tab_list_cnt a').click(function(evt) {
	  evt.preventDefault();

	  $(this).tab('show');
	});
});