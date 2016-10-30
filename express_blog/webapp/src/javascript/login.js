$(document).ready(function() {
	$('.j-tab_list_cnt a').click(function(evt) {
	  evt.preventDefault();

	  $(this).tab('show');
	});

  var loginError = $('#login_error');
  $('#login_submit').click(function(evt) {
    var form = $('#login_form')[0];
    var data = {
      username: form.username.value,
      password: form.password.value
    };

    data.password = window.md52hex(data.password); // md5加密

    // 清除错误提示
    $(loginError)
      .text('')
      .parent()
      .addClass('my-hide');

    $.ajax({
      url: '/api/login',
      method: 'post',
      data: data, 
      dataType: 'json',
      success: function(data) {
        if(data.code !== 200) {
          $(loginError)
            .text(data.msg)
            .parent()
            .removeClass('my-hide');
        } else {
          location.href = '/';
        }
      },
      error: function() {
        $(loginError)
          .text('请求错误')
          .parent()
          .removeClass('my-hide');
      }
    });
  });

  var registerError = $('#register_error');
  $('#register_submit').click(function(evt) {
    var form = $('#register_form')[0];
    var data = {
      username: form.username.value,
      password: form.password.value
    };
    var confirmPassword = form.confirm_password.value;

    if(confirmPassword !== data.password) {
      $(registerError)
        .text('两次密码不一样')
        .parent()
        .removeClass('my-hide');

      return;
    }

    data.password = window.md52hex(data.password); // md5加密

    // 清除错误提示
    $(registerError)
      .text('')
      .parent()
      .addClass('my-hide');

    $.ajax({
      url: '/api/register',
      method: 'post',
      data: data, 
      dataType: 'json',
      success: function(data) {
        if(data.code !== 200) {
          $(registerError)
            .text(data.msg)
            .parent()
            .removeClass('my-hide');
        } else {
          location.href = '/';
        }
      },
      error: function() {
        $(registerError)
          .text('请求错误')
          .parent()
          .removeClass('my-hide');
      }
    });

  });
});