'use strict';

const BaseDao = require('./base');
const db = require('../util/db');

module.exports = class BlogDao extends BaseDao {
    constructor() {
        super(db, 'blog', [
            'id',
            'name',
            'user_id',
            'create_time',
            'content',
            'type',
        ]);
    }

    async find(condition, connection) {
        let obj = {
            table: this.tableName,
            field: {
                map: {
                    'user.username': 'username'
                },
                attr: this.attr,
            },
            join: {
                table: 'user',
                type: 'inner',
                on: 'user.id = blog.user_id'
            },
            condition
        };

        return await this.db.find(obj, connection);
    }

    async search(value, connection) {
        let obj = {
            table: this.tableName,
            field: {
                map: {
                    'user.username': 'username'
                },
                attr: this.attr,
            },
            join: {
                table: 'user',
                type: 'inner',
                on: 'user.id = blog.user_id'
            },
            like: {
                value,
                attr: ['name', 'content', 'type']
            }
        };
        
        return await this.db.find(obj, connection);
    }
};
