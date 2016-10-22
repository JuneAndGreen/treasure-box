'use strict';

const BaseDao = require('./baseDao');
const db = require('../util/db');

module.exports = class BlogDao extends BaseDao {
  constructor() {
    super('blog');
  }

  *find(condition, connection) {
    let obj = {
      table: 'blog',
      field: {
      	map: {
      		'user.username': 'username'
      	},
      	attr: ['blog.*']
      },
      join: {
      	table: 'user',
      	type: 'inner',
      	on: 'user.id = blog.user_id'
      },
      condition
    };
    return yield db.find(obj, connection);
  }

  *search(query, connection) {
    let obj = {
      table: 'blog',
      field: {
      	map: {
      		'user.username': 'username'
      	},
      	attr: ['blog.*']
      },
      join: {
      	table: 'user',
      	type: 'inner',
      	on: 'user.id = blog.user_id'
      },
      like: {
      	value: query,
      	attr: ['name', 'content', 'type']
      }
    };
    return yield db.find(obj, connection);
  }
};
