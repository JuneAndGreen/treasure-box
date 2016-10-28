$(document).ready(function() {
  var summernoteElem = $('#summernote');
  var titleElem = $('#title');

  $(summernoteElem).summernote({
  	height: 600,
	  focus: true  
  });

  $('#submit').click(function() {
  	var title = $(titleElem).val();
  	var html = $(summernoteElem).summernote('code');
  	
  });

  $('#cancel').click(function() {

  });
});