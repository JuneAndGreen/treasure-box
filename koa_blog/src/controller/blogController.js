'use strict'

const _ = require('../util/api');
const validate = _.validate;
const resPkg = _.resPkg;

const BlogService = require('../service/blogService');
const service = new BlogService();

module.exports = {
  '/api/blog/:id': {
    get: function*(next) {
      let userId = this.session.userId;

      let blog = (yield service.find({id: this.__id}, userId, this))[0];
      this.body = resPkg('SUCCESS', blog);
    },

    patch: function*(next) {
      let body = this.request.body;
      let data = {
        id: body.id,
        name: body.name,
        type: body.type,
        tag: body.tag,
        content: body.content
      }
      // 判断格式
      let val = validate(data, {
        id: {required:true, value:/^\d+$/}
      });

      if(!val) {
        this.body = resPkg('PARAMERR');
      } else {
        let blog = yield service.update(data, {id: data.id})[0];
        this.body = resPkg('SUCCESS', blog);
      }
    },

    delete: function*() {
      let body = this.request.body;
      let id = body.id;

      if(!id && isNaN(id)) {
        this.body = resPkg('PARAMERR');
      } else {
        let blog = yield service.delete({id: id});
        this.body = resPkg('SUCCESS', blog);
      }
    }
  },

  '/api/blog': {
    get: function*(next) {
      let query = this.request.query;
      let userId = this.session.userId;

      query = Object.assign({}, query);
      if(query.hasOwnProperty('search')) {
        // 全站检索
        let blogs = yield service.search(query.q, userId, this);
        this.body = resPkg('SUCCESS', blogs);
      } else {
        // 获取自己的列表
        let blogs = yield service.find({userId}, userId, this);
        this.body = resPkg('SUCCESS', blogs);
      }
    },
    
    post: function*(next) {
      let body = this.request.body;
      let userId = this.session.userId;

  		// 判断格式
  		let ret = validate(body, {
  		  name: {required:true},
        type: {},
  		  content: {required:true}
  		});
  		if(!ret.success) {
  		  return this.body = resPkg('PARAMERR');
  		} 

		  let blog = yield service.add(ret.data, userId, this);
		  this.body = resPkg('SUCCESS', blog);
    }
  }
};
