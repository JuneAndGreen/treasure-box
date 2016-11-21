var mysql = require('mysql');

var pool = null;
var config = {
  connectionLimit: 100,
  database: 'express_blog_demo',
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: ''
};

/**
 * 初始化连接池
 */
function initMysqlPool() {
  pool = mysql.createPool(config);
}

module.exports = function(sql, sqlParam, callback) {
  if(!pool) initMysqlPool();

  // 获取连接
  pool.getConnection(function(err, connection) {
    if(err) return callback(err);

    connection.query(sql, sqlParam, function(err, rows) {
      connection.release(); // 释放连接

      callback(err, rows);
    });
  });
};