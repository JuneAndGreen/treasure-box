(function($, window, document) {

	/**
	 * 添加tab事件
	 */
	$('.nav .item').click(function(evt) {
		if($(this).hasClass('act')) return;

		$('.nav .item.act').removeClass('act');
		$(this).addClass('act');

		if($(this).hasClass('j-logintab')) {
			// 博客
			$('.j-login').removeClass('f-dn');
			$('.j-reg').addClass('f-dn');
		} else {
			// 搜索
			$('.j-reg').removeClass('f-dn');
			$('.j-login').addClass('f-dn');
		}
	});

	/**
	 * 点击登录按钮
	 */
	$('.j-login_btn').click(function() {
		var form = $('.j-login_form')[0];
		var data = {
			username: form.username.value,
			password: form.password.value
		};

		if(!data.username || !data.password) return;

		data.password = window.md52hex(data.password);

		$.ajax({
			url: '/api/login',
			data: data,
			type: 'post',
			timeout: 5000,
			success: function(ret) {
				if(('' + ret.code).indexOf('2') !== 0) {
					$('.j-login_err_text').text('登录失败');
					$('.j-login_err').removeClass('f-dn');
					return;
				}

				$('.j-login_err').addClass('f-dn');
				location.href = '/';
			},
			error: function() {
				$('.j-login_err_text').text('登录失败');
				$('.j-login_err').removeClass('f-dn');
			}
		});

	});
	
	/**
	 * 点击注册按钮
	 */
	$('.j-reg_btn').click(function() {
		var form = $('.j-reg_form')[0];
		var data = {
			username: form.username.value,
			password: form.password.value,
			rePassword: form['repeat_password'].value
		};

		if(!data.username || !data.password || !data.rePassword) return;

		if(data.password !== data.rePassword) {
			$('.j-reg_err_text').text('两次输入的密码不一致');
			$('.j-reg_err').removeClass('f-dn');
			return;
		}

		delete data.rePassword;
		data.password = window.md52hex(data.password);

		$.ajax({
			url: '/api/register',
			data: data,
			type: 'post',
			timeout: 5000,
			success: function(ret) {
				if(('' + ret.code).indexOf('2') !== 0) {
					$('.j-reg_err_text').text('注册失败');
					$('.j-reg_err').removeClass('f-dn');
					return;
				}

				$('.j-reg_err').addClass('f-dn');
				location.href = '/';
			},
			error: function() {
				$('.j-reg_err_text').text('注册失败');
				$('.j-reg_err').removeClass('f-dn');
			}
		});

	});

})($, window, document)