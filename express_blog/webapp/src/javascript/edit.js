$(document).ready(function() {
  var summernoteElem = $('#summernote');
  var titleElem = $('#title');

  $(summernoteElem).summernote({
  	height: 600,
	  focus: true
  });

  // set code
  $(summernoteElem).summernote('code', window._content);

  var showModal = function() {
    $('#err_modal').modal('show');
  };

  $('#submit').click(function() {
  	var title = $(titleElem).val();
  	var html = $(summernoteElem).summernote('code');
  	
    var data = {
      title: title,
      content: html
    };
    var url = '/api/add';
    if(window._id) {
      // update mode
      data.id = window._id;
      url = '/api/update';
    }

    $.ajax({
      url: url,
      method: 'post',
      data: data, 
      dataType: 'json',
      success: function(data) {
        if(data.code !== 200) {
          // show eror
          showModal();
        } else {
          location.href = '/';
        }
      },
      error: function() {
        // show eror
        showModal();
      }
    });
  });

  $('#cancel').click(function() {
    location.href = '/';
  });

  $('#logout').click(function() {
    location.href = '/logout';
  });
});