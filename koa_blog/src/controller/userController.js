'use strict'

const path = require('path');
const fs = require('fs');

const _ = require('../util/api');
const validate = _.validate;
const resPkg = _.resPkg;

const UserService = require('../service/userService');
const service = new UserService();

module.exports = {
  '/': {
    get: function*(next) {
      let session = this.session;
      if(!session.userId) {
        return this.redirect('/login');
      } 

      yield this.render('index', {
        username: session.username,
        userId: session.userId
      });
    }
  },

  '/login': {
    get: function*(next) {
      let session = this.session;
      if(session.userId) {
        return this.redirect('/');
      } 

      yield this.render('login', {});
    }
  },

  '/api/login': {
    post: function*(next) {
      let body = this.request.body;
      let session = this.session;

      // 判断格式
      let ret = validate(body, {
        username: {required: true},
        password: {required: true}
      });

      if(!ret.success) {
        return this.body = resPkg('PARAMERR');
      }

      let user = yield service.login(ret.data, this);
      // 登记session信息
      session.username = user.username;
      session.userId = user.id;
      delete user.password;
      this.body = resPkg('SUCCESS', user);
    }
  },

  '/api/register': {
    post: function*(next) {
      let body = this.request.body;
      let session = this.session;

      // 判断格式
      let ret = validate(body, {
        username: {required: true},
        password: {required: true}
      });

      if(!ret.success) {
        return this.body = resPkg('PARAMERR');
      }

      let user = yield service.add(ret.data, this);
      // 登记session信息
      session.username = user.username;
      session.userId = user.id;
      delete user.password;
      this.body = resPkg('SUCCESS', user);
    }
  },

  '/api/logout': {
    get: function*(next) {
      let session = this.session;

      delete session.username;
      delete session.userId;

      this.redirect('/login');
    }
  },

  '/api/user': {
    get: function*(next) {
      let query = this.request.query;
      let data = {
        id: query.id,
        username: query.usernaem,
        email: query.email,
        sex: query.sex,
        description: query.description
      };
      // 判断格式
      let val = validate(data, {
        id: {value:/^\d+$/},
        sex: {value:/^[0-2]$/}
      });
      if(!val) {
        this.body = resPkg('PARAMERR');
      } else {
        let users = service.find(data);
        users.forEach(function(user) {delete user.password});
        this.body = resPkg('SUCCESS', users);
      }
    },

    patch: function*(next) {
      let body = this.request.body;
      let data = {
        id: body.id,
        username: body.usernaem,
        email: body.email,
        sex: body.sex,
        description: body.description
      };
      // 判断格式
      let val = validate(data, {
        id: {required:true, value:/^\d+$/},
        sex: {value:/^[0-2]$/}
      });
      if(!val) {
        this.body = resPkg('PARAMERR');
      } else {
        let user = service.update(data, {id: data.id})[0];
        delete user.password;
        this.body = resPkg('SUCCESS', user);
      }
    }
  }


};
