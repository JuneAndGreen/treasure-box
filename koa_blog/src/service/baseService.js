'use strict';

const _ = require('../util/api');
const db = require('../util/db').db;

module.exports = class BaseService {
  constructor(dao) {
    this.dao = dao;
  }
  /**
   * 增
   */
  *add(data, userId, ctx) {
    let ret = yield this.dao.add(data);
    let id = ret.insertId;

    let reses = yield this.dao.find({id});

    return reses[0];
  }
  /**
   * 删
   */
  *del(id, userId, ctx) {
    let reses = yield this.dao.find({id});

    // 开始事务
    let connection = yield db.beginTransaction();
    ctx.__connection = connection;

    let ret = yield dao.del({id}, connection);

    // 结束事务
    yield db.commitTransaction(connection);

    return reses[0];
  }
  /**
   * 改
   */
  *update(obj, userId, ctx) {
    yield dao.update(obj);

    let reses = yield this.dao.find({id: obj.condition.id});

    return reses[0];
  }
  /**
   * 查
   */
  *find(condition, userId, ctx) {    
    let reses = yield this.dao.find(condition);

    return reses;
  }
};
