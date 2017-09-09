'use strict'

const _ = require('../util/api');
const validate = _.validate;

const BlogService = require('../service/blog');
const service = new BlogService();

const ParamIllegalError = require('../error/index').ParamIllegalError;

async function findOne(ctx, next) {
    let userId = ctx.session.userId;

    ctx.result = (await service.find({ id: ctx.__id }, ctx))[0];
}

async function update(ctx, next) {
    // 判断格式
    let query = validate(ctx.query, {
        id: { required:true, value:/^\d+$/ },
        name: {},
        type: {},
        content: {},
    });

    ctx.result = await service.update(query);
}

async function remove(ctx, next) {
    let body = ctx.request.body;
    let id = body.id;

    if (!id && isNaN(id)) {
        throw new ParamIllegalError();
    }

    ctx.result = await service.del(id);
}

async function findList(ctx, next) {
    let userId = ctx.session.userId;

    if (ctx.query.search !== undefined) {
        // 全站检索
        ctx.result = await service.search(ctx.query.search, ctx);
    } else {
        // 获取自己的列表
        ctx.result = await service.find({ user_id: userId }, ctx);
    }
}

async function create(ctx, next) {
    let userId = ctx.session.userId;

    // 判断格式
    let query = validate(ctx.query, {
        name: { required: true },
        type: { default: '未分类' },
        content: { required: true }
    });

    query.user_id = userId;

    ctx.result = await service.add(query, ctx);
}

module.exports = {
    findOne,
    findList,
    create,
    update,
    remove,
};
