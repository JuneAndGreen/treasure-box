'use strict';

var Router = require('koa-router');

const methodMap = {
	get: ['get'],
	post: ['post'],
	put: ['put'],
	delete: ['del'],
	patch: ['patch'],
	head: ['head'],
	all: ['get', 'post', 'put', 'del', 'patch', 'head']
};
const methods = Object.keys(methodMap);
// 空函数
var plainFunc = function*(next) {yield next;};

module.exports = function getRouter(map) {
	let router = Router();
	let urls = Object.keys(map);
	for(let url of urls) {
		let item = map[url];
		let isRegexp = item.isRegexp || false;
		let before = item.before || plainFunc;
		let after = item.after || plainFunc;

		for(let method of methods) {
			if(item.hasOwnProperty(method) && typeof item[method] === 'function') {
				let func = item[method];
				let routes = methodMap[method];

				for(let route of routes) {
					// 注册路由
					if(isRegexp) {
						// 使用正则作为路由
						url = new RegExp(url);
					}
					router[route](url, before, func, after);
				}
			}
		}
	}

	return router;
};
