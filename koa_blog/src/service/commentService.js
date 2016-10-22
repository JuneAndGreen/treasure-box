'use strict';

const BaseService = require('./baseService');
const CommentDao = require('../dao/commentDao');

module.exports = class CommentService extends BaseService {
    constructor() {
        super(new CommentDao());
    }
};