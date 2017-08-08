'use strict';

const BaseDao = require('./base');
const db = require('../util/db');

module.exports = class UserDao extends BaseDao {
    constructor() {
        super(db, 'user', [
            'id',
            'username',
            'password',
            'email',
            'head',
            'description',
            'sex',
        ]);
    }
};