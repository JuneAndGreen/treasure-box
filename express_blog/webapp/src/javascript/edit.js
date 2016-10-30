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
  	
    // $.ajax({
    //   url: '/api/login',
    //   method: 'post',
    //   data: data, 
    //   dataType: 'json',
    //   success: function(data) {
    //     if(data.code !== 200) {
    //       $(loginError)
    //         .text(data.msg)
    //         .parent()
    //         .removeClass('my-hide');
    //     } else {
    //       location.href = '/';
    //     }
    //   },
    //   error: function() {
    //     $(loginError)
    //       .text('请求错误')
    //       .parent()
    //       .removeClass('my-hide');
    //   }
    // });
  });

  $('#cancel').click(function() {
    location.href = '/';
  });

  $('#logout').click(function() {
    location.href = '/api/logout';
  });
});