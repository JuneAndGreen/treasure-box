'use strict'

const _ = require('../util/api');
const validate = _.validate;
const resPkg = _.resPkg;

const CommentService = require('../service/commentService');
const service = new CommentService();

module.exports = {
  '/api/comment/:id': {
		delete: function*(next) {
		  let body = this.request.body;
		  let id = body.id;
		  if(!id && isNaN(id)) {
				this.body = resPkg('PARAMERR');
		  } else {
				let comment = service.delete({id: id});
				this.body = resPkg('SUCCESS', comment);
		  }
		}
  },

  '/api/commnet/': {
  	get: function*(next) {
  	  let query = this.request.query;
		  let data = {
				id: query.id,
				user: query.user,
				reply: query.reply,
				content: query.content,
				parentId: query.parentId
		  }
		  // 判断格式
		  let val = validate(data, {
				id: {value:/^\d+$/},
				user: {value:/^\d+$/},
				reply: {value:/^\d+$/},
				parentId: {value:/^\d+$/}
		  });

		  if(!val) {
				this.body = resPkg('PARAMERR');
		  } else {
				let comments = service.find(data);
				this.body = resPkg('SUCCESS', comments);
		  }
  	},

  	post: function*(next) {
  	  let body = this.request.body;
		  let data = {
				user: body.user,
				reply: body.reply,
				content: body.content,
				parentId: body.parentId
		  }
		  // 判断格式
		  let val = validate(data, {
				user: {required:true, value:/^\d+$/},
				reply: {value:/^\d+$/},
				content: {require:true},
				parentId: {required:true, value:/^\d+$/}
		  });

		  if(!val) {
				this.body = resPkg('PARAMERR');
		  } else {
				data['create_time'] = +new Date();
				let comment = service.add(data);
				this.body = resPkg('SUCCESS', comment);
		  }
  	}
  }
};
