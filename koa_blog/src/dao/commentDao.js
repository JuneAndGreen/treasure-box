'use strict';

const BaseDao = require('./baseDao');
const db = require('../util/db');

module.exports = class CommentDao extends BaseDao {
  constructor() {
    super('comment');
  }

  *getCount(parentIds, connection) {
  	let obj = {
      table: 'comment',
      condition: {
      	parentId: parentIds
      }
    };

    let rows = yield db.find(obj, connection);
    
    let map = {};
    rows.forEach((row) => {
    	if(map[row.parentId] === undefined) map[row.parentId] = 0;

    	map[row.parentId] ++;
    });

    return map;
  }
};