'use strict';

const BaseService = require('./baseService');
const UserDao = require('../dao/userDao');

module.exports = class UserService extends BaseService {
    constructor() {
        super(new UserDao());
    }

    *login(obj, ctx) {
    	let user = (yield this.dao.find({username: obj.username}))[0];

    	if(!user || user.password !== obj.password) throw 'BAD_REQUEST';

    	return user;
    }

    *add(obj, ctx) {
    	let user = (yield this.dao.find({username: obj.username}))[0];
        console.log('aaa');

    	if(user) throw 'BAD_REQUEST';

    	let ret = yield this.dao.add(obj);
    	return (yield this.dao.find({id: ret.insertId}))[0];
    }
};