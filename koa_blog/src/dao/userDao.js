'use strict';

const BaseDao = require('./baseDao');
const db = require('../util/db');

module.exports = class UserDao extends BaseDao {
  constructor() {
    super('user');
  }
};