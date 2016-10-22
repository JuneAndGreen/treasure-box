'use strict'

const _ = require('../util/api');
const validate = _.validate;
const resPkg = _.resPkg;

const ShareService = require('../service/shareService');
const service = new ShareService();

module.exports = {
  '/api/share/:id': {
  	delete: function*(next) {
  	  let body = this.request.body;
		  let id = body.id;
		  if(!id && isNaN(id)) {
				this.body = resPkg('PARAMERR');
				return;
		  } else {
				let share = service.delete({id: id});
				this.body = resPkg('SUCCESS', result);
		  }
  	}
  },

  'api/share': {
  	get: function*(next) {
  		let query = this.request.query;
			let data = {
				id: query.id,
				user: query.user,
				parentId: query.parentId
			}
			// 判断格式
			let val = validate(data, {
				id: {value:/^\d+$/},
				user: {value:/^\d+$/},
				parentId: {value:/^\d+$/}
			});
			if(!val) {
				this.body = resPkg('PARAMERR');
			} else {
				let shares = service.find(data);
				this.body = resPkg('SUCCESS', shares);
			}
  	}, 

  	post: function*(next) {
  		let body = this.request.body;
			let data = {
				user: body.user,
				parentId: body.parentId
			}
			// 判断格式
			let val = validate(data, {
				user: {required:true, value:/^\d+$/},
				parentId: {required:true, value:/^\d+$/}
			});
			if(!val) {
				this.body = resPkg('PARAMERR');
			} else {
				data['create_time'] = +new Date();
				let share = service.add(data);
				this.body = resPkg('SUCCESS', share);
			}
  	}
  }
};
