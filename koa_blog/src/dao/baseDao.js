'use strict';

const _ = require('../util/api');
const db = require('../util/db');

module.exports = class BaseDao {
  constructor(name) {
    this.name = name;
  }
  /**
   * 增
   */
  *add(data, connection) {
    let obj = {
      table: this.name,
      data
    };
    return yield db.add(obj, connection);
  }
  /**
   * 删
   */
  *del(condition, connection) {
    let obj = {
      table: this.name,
      condition
    };
    return yield db.del(obj, connection);
  }
  /**
   * 改
   */
  *update(d, connection) {
    let obj = {
      table: this.name,
      data: d.data,
      condition: d.condition
    };
    return yield db.update(obj, connection);
  }
  /**
   * 查
   */
  *find(condition, connection) {
    let obj = {
      table: this.name,
      condition
    };
    return yield db.find(obj, connection);
  }
};
