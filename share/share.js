(function() {
    const description = document.getElementsByTagName('meta')['description'];

    // 默认配置
    const DefaultOptions = {
        url: location.href, // 分享链接
        title: document.title, // 分享标题
        desc: description && description.content || '', // 分享描述
        summary: description && description.content || '', // 分享梗概
        appName: location.host, // 分享来源
        userName: '', // 分享用户名
        imgTitle: '', // 分享图片标题
        img: '' // 分享图片
    };

    class Share {
        constructor(options = {}) {
            Object.assign(DefaultOptions, options)
        }

        /**
         * 打开分享窗口
         */
        open(options, url) {
            let query = [];
            Object.keys(options).forEach(key => {
                let item = options[key];
                query.push(key + '=' + encodeURIComponent(item));
            });

            url = url + query.join('&');
            window.open(url);
        }

        /**
         * 整合分享参数
         */
        mergeOptions(key, options) {
            let ret = {
                options: {},
                url: ''
            };

            switch (key) {
                case 'weibo':
                    ret.options = {
                        appkey: '',
                        url: options.url,
                        title: options.title,
                        source: options.title,
                        sourceUrl: location.href,
                        content: 'utf-8',
                        pic: options.img
                    };
                    ret.url = 'http://v.t.sina.com.cn/share/share.php?';
                    break
                case 'qzone':
                    ret.options = {
                        url: options.url,
                        title: options.title,
                        desc: options.desc,
                        summary: options.summary || options.desc,
                        site: location.host
                    };
                    ret.url = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?';
                    break
                case 'qq':
                    ret.options = {
                        url: options.url,
                        title: options.title,
                        desc: options.desc,
                        source: options.title,
                        pics: options.img
                    };
                    ret.url = 'http://connect.qq.com/widget/shareqq/index.html?';
                    break
                case 'facebook':
                    ret.options = {
                        u: options.url
                    };
                    ret.url = 'https://www.facebook.com/sharer/sharer.php?';
                    break;
                case 'twitter':
                    ret.options = {
                        text: options.title,
                        url: options.url,
                        via: location.origin
                    };
                    ret.url = 'https://twitter.com/intent/tweet?';
                    break
                case 'linkedin':
                    ret.options = {
                        title: options.title,
                        url: options.url,
                        source: options.title,
                        summary: options.summary || options.desc,
                        mini: true,
                        ro: true,
                        armin: 'armin'
                    };
                    ret.url = 'http://www.linkedin.com/shareArticle?';
                    break
                case 'douban':
                    ret.options = {
                        name: options.title,
                        href: options.url,
                        text: options.desc,
                        image: options.img,
                        starid: 0,
                        aid: 0,
                        style: 11
                    };
                    ret.url = 'http://shuo.douban.com/!service/share?';
                    break;
            }

            return ret;
        }

        /**
         * 进行分享
         */
        doShare(key, options = {}) {
            options = Object.assign({}, DefaultOptions, options);
            let merge = this.mergeOptions(key, options);

            this.open(merge.options, merge.url);
        }
    }

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = Share;
    } else {
        window.Share = Share;
    }
})();
