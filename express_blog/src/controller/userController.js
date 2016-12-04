var userService = require('../service/userService');
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

    userService.register(ret.data, function(err, user) {
      if(err) {
        return res.send(_.resPkg('PARAMERR'));
      }

      if(err === 'USEREXISTS') {
        return res.send(_.resPkg('USEREXISTS'));
      }


      req.session.username = user.username; // 存储session
      delete user.password;
      res.send(_.resPkg('SUCCESS', user));
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

    userService.login(ret.data, function(err, user) {
      if(err) {
        return res.send(_.resPkg('PARAMERR'));
      }

      if(err === 'USERNOTEXISTS') {
        return res.send(_.resPkg('USERNOTEXISTS'));
      }

      if(err === 'PWDERR') {
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