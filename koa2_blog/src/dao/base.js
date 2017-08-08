'use strict';

class Base {
    constructor(db, tableName, attr) {
        this.db = db;

        this.tableName = tableName;
        this.attr = attr;
    }

    /**
     * 增
     */
    async add(data, connection) {
        let obj = {
            table: this.tableName,
            data
        };

        return await this.db.add(obj, connection);
    }

    /**
     * 删
     */
    async del(condition, connection) {
        let obj = {
            table: this.tableName,
            condition
        };

        return await this.db.del(obj, connection);
    }

    /**
     * 改
     */
    async update(data, condition, connection) {
        let obj = {
            table: this.tableName,
            data,
            condition
        };

        return await this.db.update(obj, connection);
    }

    /**
     * 查
     */
    async find(condition = {}, connection) {
        let obj = {
            field: {
                attr: this.attr
            },
            table: this.tableName,
            condition
        };

        return await this.db.find(obj, connection);
    }
}

module.exports = Base;
