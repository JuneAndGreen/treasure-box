var crypto = require('crypto');

var userDao = require('../dao/userDao');
var _ = require('../util/api');

module.exports = {
  /**
   * 注册
   */
  register: function(data, callback) {
    // 密码加密
    data.password = crypto.createHash('md5').update(data.password).digest('hex');

    userDao.findOne(data.username, function(err, user) {
      if(err) {
        return callback(err);
      }

      if(user) {
        return callback('USEREXISTS');
      }

      userDao.add(data, callback);
    });
  },
  /**
   * 登录
   */
  login: function(data, callback) {
    userDao.findOne(data.username, function(err, user) {
      if(err) {
        return callback('PARAMERR');
      }

      if(!user) {
        return callback('USERNOTEXISTS');
      }

      // 密码加密
      data.password = crypto.createHash('md5').update(data.password).digest('hex');

      if(user.password !== data.password) {
        return callback('PWDERR');
      }

      callback(null, user);
    });
  }
};