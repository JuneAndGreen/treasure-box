'use strict';

const BaseService = require('./base');
const UserDao = require('../dao/user');

const ParamIllegalError = require('../error/index').ParamIllegalError;

module.exports = class UserService extends BaseService {
    constructor() {
        super(new UserDao());
    }

    async login(obj, ctx) {
    	let user = (await this.dao.find({ username: obj.username }))[0];

    	if(!user || user.password !== obj.password) throw new ParamIllegalError();

    	return user;
    }

    async add(obj, ctx) {
    	let users = await this.dao.find({ username: obj.username });

    	if (users.length) throw new ParamIllegalError();

    	let ret = await this.dao.add(obj);
    	return (await this.dao.find({ id: ret.insertId }))[0];
    }
};