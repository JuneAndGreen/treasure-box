var assert = require('assert');
var should = require('should');

var userService = require('../../src/service/userService');

// 生成用户数据
function getUserData() {
  return {
    username: 'auto-user-' + (+new Date()),
    password: 'auto-pwd-' + (+new Date())
  };
}

// 获取用户的数据库字段
function getUserProperties() {
  return ['username', 'password'];
}

describe('userService module', function() {

  describe('register', function() {
    it('用户注册', function(done) {
      userService.register(getUserData(), function(err, ret) {
        if(err) {
          done(err);
        } else {
          ret.should.have.properties(getUserProperties());
          done();
        }
      });
    });
  });

  describe('login', function() {
    it('用户登录', function(done) {
      var user = getUserData();
      var username = user.username;
      var password = user.password;
      userService.register(user, function(err, ret) {
        if(err) {
          done(err);
        } else {
          ret.should.have.properties(getUserProperties());

          console.log(user)

          userService.login({username: username, password: password}, function(err, ret) {
            if(err) {
              done(err);
            } else {
              ret.should.have.properties(getUserProperties());
              ret.username.should.be.eql(username);
              done();
            }
          });
        }
      });
    });
  });

});