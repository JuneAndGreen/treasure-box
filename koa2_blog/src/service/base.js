'use strict';

const _ = require('../util/api');
const db = require('../util/db');

module.exports = class BaseService {
    constructor(dao) {
        this.dao = dao;
    }

    /**
     * 增
     */
    async add(data, ctx) {
        let ret = await this.dao.add(data);
        let id = ret.insertId;

        let reses = await this.dao.find({ id });

        return reses[0];
    }

    /**
     * 删
     */
    async del(id, ctx) {
        let reses = await this.dao.find({ id });

        // 开始事务
        let connection = await db.beginTransaction();
        ctx.__connection = connection;

        let ret = await dao.del({ id }, connection);

        // 结束事务
        await db.commitTransaction(connection);

        return reses[0];
    }

    /**
     * 改
     */
    async update(obj, ctx) {
        await dao.update(obj, obj.id);

        let reses = await this.dao.find({id: obj.id});

        return reses[0];
    }
    
    /**
     * 查
     */
    async find(condition, ctx) {    
        let reses = await this.dao.find(condition);

        return reses;
    }
};
