'use strict';

const mysql = require('mysql');
const GenSql = require('gen-sql');
const _ = require('./api');
const wa = _.wa;

const gen = new GenSql();
var pool = null;

const config = {
  connectionLimit: 100,
  database: 'junebox',
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

var db = {
  /**
   * 执行sql查询
   */
  query: function(sql, sqlParam, callback, connection) {
    let logger = global.logger;
    if(logger && logger.debug) {
      // 打印sql语句
      logger.debug(`执行sql语句：${sql}`, sqlParam);
    }

    if(connection) {
      connection.query(sql, sqlParam, (err, rows) => callback(err, rows));
    } else {
      if(!pool) {
        initMysqlPool();
      }
      pool.getConnection((err, connection) => {
        if(err) {
          callback(err);
          return;
        }
        connection.query(sql, sqlParam, (err, rows) => {
          connection.release();
          if(err) {
            callback(err)
          } else {
            callback(null, rows);
          }
        });
      });
    }
  },
  /**
   * 获取一个mysql连接
   */
  getConnection: wa(function(callback) {
    if(!pool) {
      initMysqlPool();
    }
    pool.getConnection((err, connection) => {
      if(err) {
        connection && connection.release();
        callback(err, connection);
      } else {
        callback(null, connection);
      }
    });
  }),
  /**
   * 开始事务
   */
  beginTransaction: wa(function(callback) {
    if(!pool) {
      initMysqlPool();
    }
    pool.getConnection((err, connection) => {
      if(err) {
        connection && connection.release();
        callback(err, connection);
      } else {
        connection.beginTransaction((err) => {callback(err, connection)});
      }
    });
  }),
  /**
   * 结束并提交事务
   */
  commitTransaction: wa(function(connection, callback) {
    connection.commit((err) => {
      connection.release();
      callback(err);
    });
  }),
  /**
   * 结束并回滚事务
   */
  rollbackTransaction: wa(function(connection, callback) {
    connection.rollback((err) => {
      connection.release();
      callback(err);
    });
  }),
  /**
   * 执行增语句
   */
  add: wa(function(obj, connection, callback) {
    if(typeof connection === 'function') {
      callback = connection;
      connection = null;
    }
    let genObj = gen.add(obj);
    db.query(genObj.sql, genObj.data, callback, connection);
  }),
  /**
   * 执行删语句
   */
  del: wa(function(obj, connection, callback) {
    if(typeof connection === 'function') {
      callback = connection;
      connection = null;
    }
    let genObj = gen.del(obj);
    db.query(genObj.sql, genObj.data, callback, connection);
  }),
  /**
   * 执行改语句
   */
  update: wa(function(obj, connection, callback) {
    if(typeof connection === 'function') {
      callback = connection;
      connection = null;
    }
    let genObj = gen.update(obj);
    db.query(genObj.sql, genObj.data, callback, connection);
  }),
  /**
   * 执行查语句
   */
  find: wa(function(obj, connection, callback) {
    if(typeof connection === 'function') {
      callback = connection;
      connection = null;
    }
    let genObj = gen.find(obj);
    db.query(genObj.sql, genObj.data, (err, rows) => {
      if(err) callback(err);
      else {
        let rets = [];
        for(let row of rows) {
          let keys = Object.keys(row);
          let ret = {};
          for(let key of keys) {
            let newKey = _.toCamel(key);
            ret[newKey] = row[key];

            if(newKey === 'createTime') {
              ret[newKey] = _.format(ret[newKey], 'yyyy-MM-dd HH:mm');
            }
          }
          rets.push(ret);
        }
        callback(null, rets);
      }
    }, connection);
  })
};

module.exports = db;
