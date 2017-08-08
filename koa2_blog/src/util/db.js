'use strict';

const mysql = require('mysql');
const GenSql = require('gen-sql');

const gen = new GenSql();
var pool = null;

const config = {
  connectionLimit: 50,
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

module.exports = {
    /**
     * 执行sql查询
     */
    query(sql, sqlParam, connection) {
        // 打印sql语句
        console.log(`执行sql语句：${sql}`);
        console.log(`参数：${JSON.stringify(sqlParam)}`);

        return new Promise((resolve, reject) => {
            if (connection) {
                connection.query(sql, sqlParam, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            } else {
                if (!pool) {
                    initMysqlPool();
                }

                pool.getConnection((err, connection) => {
                    if (err) {
                        reject(err);
                    } else {
                        connection.query(sql, sqlParam, (err, rows) => {
                            connection.release();
                            if(err) {
                                reject(err)
                            } else {
                                resolve(rows);
                            }
                        });
                    }
                });
            }
        });
    },

    /**
     * 获取一个mysql连接
     */
    getConnection() {
        return new Promise((resolve, reject) => {
            if (!pool) {
                initMysqlPool();
            }

            pool.getConnection((err, connection) => {
                if(err) {
                    connection && connection.release();
                    reject(err);
                } else {
                    resolve(connection);
                }
            });
        });
    },

    /**
     * 开始事务
     */
    beginTransaction(ctx) {
        return new Promise((resolve, reject) => {
            if (!pool) {
                initMysqlPool();
            }

            pool.getConnection((err, connection) => {
                if(err) {
                    connection && connection.release();
                    reject(err);
                } else {
                    connection.beginTransaction(err => {
                        if(err) {
                            connection && connection.release();
                            reject(err);
                        } else {
                            // 挂在ctx下
                            if (ctx) ctx.__connection = connection;

                            resolve(connection);
                        }
                    });
                }
            });
        });
    },

    /**
     * 结束并提交事务
     */
    commitTransaction(connection) {
        return new Promise((resolve, reject) => {
            connection.commit(err => {
                connection.release();

                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },

    /**
     * 结束并回滚事务
     */
    rollbackTransaction(connection) {
        return new Promise((resolve, reject) => {
            connection.rollback((err) => {
                connection.release();

                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },

    /**
     * 执行增语句
     */
    async add(obj, connection) {
        let genObj = gen.add(obj);
        return await this.query(genObj.sql, genObj.data, connection);
    },

    /**
     * 执行删语句
     */
    async del(obj, connection) {
        let genObj = gen.del(obj);
        return await this.query(genObj.sql, genObj.data, connection);
    },

    /**
     * 执行改语句
     */
    async update(obj, connection) {
        let genObj = gen.update(obj);
        return await this.query(genObj.sql, genObj.data, connection);
    },

    /**
     * 执行查语句
     */
    async find(obj, connection) {
        let genObj = gen.find(obj);
        return await this.query(genObj.sql, genObj.data, connection);
    }
}
