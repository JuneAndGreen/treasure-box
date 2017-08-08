'use strict'

const path = require('path');
const fs = require('fs');

const _ = require('../util/api');
const validate = _.validate;

const UserService = require('../service/user');
const service = new UserService();

async function indexPage(ctx, next) {
    let session = ctx.session;
    if (!session.userId) {
        return ctx.redirect('/login');
    } 

    await ctx.render('index', {
        username: session.username,
        userId: session.userId
    });
}

async function loginPage(ctx, next) {
    let session = ctx.session;
    if (session.userId) {
        return ctx.redirect('/');
    } 

    await ctx.render('login', {});
}

async function login(ctx, next) {
    let session = ctx.session;

    // 判断格式
    let query = validate(ctx.query, {
        username: { required: true },
        password: { required: true }
    });

    let user = await service.login(query, ctx);

    // 登记session信息
    session.username = user.username;
    session.userId = user.id;
    delete user.password;

    ctx.result = user;
}

async function register(ctx, next) {
    let session = ctx.session;

    // 判断格式
    let query = validate(ctx.query, {
        username: { required: true },
        password: { required: true }
    });

    let user = await service.add(query, ctx);

    // 登记session信息
    session.username = user.username;
    session.userId = user.id;
    delete user.password;
    
    ctx.result = user;
}

async function logout(ctx, next) {
    let session = ctx.session;

    delete session.username;
    delete session.userId;

    ctx.redirect('/login');
}

module.exports = {
    indexPage,
    loginPage,
    login,
    register,
    logout,
};
