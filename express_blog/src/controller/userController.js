var crypto = require('crypto');

var userDao = require('../dao/userDao');
var _ = require('../util/api');

module.exports = {
  /**
   * 注册
   */
  register: function(req, res, next) {
    // 校验参数
    var ret = _.validate(req.body, {
      username: {required: true},
      password: {required: true}
    });

    if(!ret.success) {
      return res.send(_.resPkg('PARAMERR'));
    }

    // 密码加密
    ret.data.password = crypto.createHash('md5').update(ret.data.password).digest('hex');

    userDao.findOne(ret.data.username, function(err, user) {
      if(err) {
        return res.send(_.resPkg('PARAMERR'));
      }

      if(user) {
        return res.send(_.resPkg('USEREXISTS'));
      }

      userDao.add(ret.data, function(err, user) {
        if(err) {
          return res.send(_.resPkg('PARAMERR'));
        }

        req.session.username = user.username; // 存储session
        delete user.password;
        res.send(_.resPkg('SUCCESS', user));
      });
    });
  },
  /**
   * 登录
   */
  login: function(req, res, next) {
    // 校验参数
    var ret = _.validate(req.body, {
      username: {required: true},
      password: {required: true}
    });

    if(!ret.success) {
      return res.send(_.resPkg('PARAMERR'));
    }

    userDao.findOne(ret.data.username, function(err, user) {
      if(err) {
        return res.send(_.resPkg('PARAMERR'));
      }

      if(!user) {
        return res.send(_.resPkg('USERNOTEXISTS'));
      }

      // 密码加密
      ret.data.password = crypto.createHash('md5').update(ret.data.password).digest('hex');

      if(user.password !== ret.data.password) {
        return res.send(_.resPkg('PWDERR'));
      }

      req.session.username = user.username; // 存储session
      delete user.password;
      res.send(_.resPkg('SUCCESS', user));
    });
  },
  /**
   * 登出
   */
  logout: function(req, res, next) {
    req.session.username = ''; // 删除session
    res.redirect('/login');
  },
  /**
   * 登录页
   */
  loginPage: function(req, res, next) {
    res.render('login');
  }
};