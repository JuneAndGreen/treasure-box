(function($, window, document) {

	/**
	 * 检查url
	 */
	function checkUrl(evt) {
		var hash = (location.hash || '').substr(1).split('&');

		toPage(hash.shift(), hash);
	}

	window.onhashchange = checkUrl;
	checkUrl();

	/**
	 * 到达某页
	 */
	function toPage(page, paramArr) {
		var param = {};
		if(paramArr.length) {
			paramArr.forEach(function(item) {
				item = item.split('=');
				param[item[0]] = item[1];
			});
		}

		$('.j-page').addClass('f-dn');
		$('.j-tablist a.act').removeClass('act');
		switch(page) {
			case 'edit':
				// 编辑博客
				$('.m-edit').removeClass('f-dn');
				break;
			case 'search':
				// 检索
				$('.m-search').removeClass('f-dn');
				$('.j-searchtab').addClass('act');
				break;
			case 'blog':
				// 博客
				$('.m-blog').removeClass('f-dn');
				enterBlog(param.id);
				break;
			case 'bloglist':
			default:
				// 博客列表
				$('.m-bloglist').removeClass('f-dn');
				$('.j-blogtab').addClass('act');
				enterBlogList();
				break;
		}
	}

	/**
	 * 登出按钮
	 */
	$('.j-logout').click(function() {
		location.href = '/api/logout';
	});

	/**
	 * 新建博客
	 */
	$('.j-new_blog').click(function() {
		var form = $('.j-blog_form')[0];
		var data = {
			name: form.name.value,
			type: form.type.value,
			content: form.content.value
		};

		$.ajax({
			url: '/api/blog',
			type: 'post',
			data: data,
			timeout: 5000,
			success: function(ret) {

			},
			error: function() {

			}
		});
	});

	/**
	 * 点击搜索按钮
	 */
	$('.j-search_btn').click(function() {
		var query = $('.j-search_ipt').val();

		$.ajax({
			url: '/api/blog?search',
			type: 'get',
			data: {
				q: query
			},
			timeout: 5000,
			success: function(ret) {
				if(('' + ret.code).indexOf('2') !== 0) return;

				// 渲染搜索页面
				$('.m-search .listcnt').html(window.parseTpl($('#t-search').html(), {
					blist: ret.result
				}));
			},
			error: function() {

			}
		});
	});

	/**
	 * 进入博客列表
	 */
	function enterBlogList() {
		$.ajax({
			url: '/api/blog',
			type: 'get',
			timeout: 5000,
			success: function(ret) {
				if(('' + ret.code).indexOf('2') !== 0) return;

				// 渲染博客列表页面
				$('.m-bloglist').html(window.parseTpl($('#t-bloglist').html(), {
					blist: ret.result
				}));
			},
			error: function() {

			}
		});
	}

	/**
	 * 进入博客
	 */
	function enterBlog(id) {
		$.ajax({
			url: '/api/blog/' + id,
			type: 'get',
			timeout: 5000,
			success: function(ret) {
				if(('' + ret.code).indexOf('2') !== 0) return;

				// 渲染博客列表页面
				var blog = ret.result;
				blog.myId = window.userId;
				$('.m-blog .blogcnt').html(window.parseTpl($('#t-blog').html(), ret.result));

				// 快捷按钮
				$('.m-link li').click(function() {
					var parent = $(this).parent();
					var id = parent.attr('data-id');

					var action = $(this).attr('data-action');

					switch(action) {
						case 'comment':
							break;
						case 'share':
							break;
						case 'edit':
							location.hash = '#edit&id=' + id;
							break;
						case 'del':
							break;
						case 'new':
							location.hash = '#edit';
							break;
					}
				});
			},
			error: function() {

			}
		});
	}
	

})($, window, document)