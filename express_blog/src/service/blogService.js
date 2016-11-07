var blogDao = require('../dao/blogDao');

module.exports = {
  /**
   * 增
   */
  add: function(data, callback) {
    blogDao.add(data, callback);
  },
  /**
   * 改
   */
  update: function(data, callback) {
    blogDao.findOne(data.id, function(err, blog) {
      if(err) {
        return callback(err);
      }

      if(!blog) {
        return callback(new Error('blog not found!'));
      }

      blogDao.update(data, callback);
    });
  },
  /**
   * 删
   */
  del: function(data, callback) {
    blogDao.findOne(data.id, function(err, blog) {
      if(err) {
        return callback(err);
      }

      if(!blog) {
        return callback(new Error('blog not found!'));
      }

      if(blog.username !== data.username) {
        return callback(new Error('permission denied!'));
      }

      blogDao.del(data.id, callback);
    });
  },
  /**
   * 查
   */
  findAllByUsername: function(username, callback) {
    blogDao.findAllByUsername(username, callback);
  },
  findOne: function(id, callback) {
    blogDao.findOne(id, callback);
  }
};