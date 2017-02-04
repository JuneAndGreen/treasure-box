var mysql = require('mysql');
var _ = require('./api');

var pool = null;
var config = {
  connectionLimit: 100,
  database: 'express_blog_demo',
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'root'
};

/**
 * 初始化连接池
 */
function initMysqlPool() {
  pool = mysql.createPool(config);
}

module.exports = function(sql, sqlParam, callback) {
  _.log(sql);
  _.log('params -- ' + JSON.stringify(sqlParam));

  if(!pool) initMysqlPool();

  // 获取连接
  pool.getConnection(function(err, connection) {
    if(err) {
      _.error(err.stack);
      return callback(err);
    }

    connection.query(sql, sqlParam, function(err, rows) {
      if(err) _.error(err.stack);
      
      connection.release(); // 释放连接

      callback(err, rows);
    });
  });
};