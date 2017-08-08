'use strict';

const BaseService = require('./base');
const BlogDao = require('../dao/blog');

module.exports = class BlogService extends BaseService {
    constructor() {
        super(new BlogDao());
    }

    async search(query, ctx) {
        query = query || '';
        return await this.dao.search(query);
    }
};
