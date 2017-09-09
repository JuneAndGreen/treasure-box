'use strict';

const fs = require('fs');
const path = require('path');

const Counter = require('passthrough-counter');
const humanize = require('humanize-number');
const bytes = require('bytes');
const Koa = require('koa');
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');
const staticDir = require('koa-static');
const render = require('koa-ejs');
const router = require('koa-router')()

const filterConfig = require('./config/filter');
const controllerConfig = require('./config/controller');
const db = require('./util/db');
const winstonLogger = require('./util/log');

// 格式化请求时间
function time(start) {
    const delta = Date.now() - start;
    return humanize(delta < 10000 ? delta + 'ms' : Math.round(delta / 1000) + 's');
}

let app = new Koa();
app.proxy = true;

// overwrite console
console.log = winstonLogger.info;
console.info = winstonLogger.info;
console.error = winstonLogger.error;
console.warn = winstonLogger.warn;

// logger
app.use(async(ctx, next) => {
    let start = Date.now();
    console.log(`  <-- ${ctx.method} ${ctx.originalUrl}`);

    try {
        await next();
    } catch (err) {
        console.log(`  xxx ${ctx.method} ${ctx.originalUrl} ${err.status || 500} ${time(start)} --`);
        throw err;
    }

    let status = ctx.status || 404;

    let length = ctx.response.length;
    let body = ctx.body;
    let counter;
    if (length === undefined && body && body.readable) {
        ctx.body = body
            .pipe(counter = Counter())
            .on('error', ctx.onerror);
    }

    let res = ctx.res;

    // 获取返回长度
    if (counter) length = counter.length;
    if (~[204, 205, 304].indexOf(status)) {
        length = '';
    } else if (length === undefined) {
        length = '-'
    } else {
        length = bytes(length).toLowerCase();
    }

    res.once('finish', () => {
        console.log(`  --> ${ctx.method} ${ctx.originalUrl} ${status} ${time(start)} ${length}`);
    });
    res.once('close', () => {
        console.log(`  -x- ${ctx.method} ${ctx.originalUrl} ${status} ${time(start)} ${length}`);
    });
});

// view egine
render(app, {
    root: path.join(__dirname, './views'),
    layout: false,
    viewExt: 'ejs',
    cache: true,
    debug: false
});

// static dir
app.use(staticDir(path.join(__dirname, '../webapp')));

// bodyParser
app.use(bodyParser());

// merge parameter
app.use(async (ctx, next) => {
    Object.assign(ctx.query, ctx.request.body, ctx.request.files, ctx.request.fields);

    await next();
});

// session
app.keys = ['THIS IS A SECRECT FOR JUNE_01 BLOG'];
app.use(session({
    key: 'SID',
    maxAge: 60 * 60 * 24 * 1000, // 一天
    overwrite: true,
    httpOnly: true,
    signed: false,
}, app))

// xhr or view error
app.use(async (ctx, next) => {
    try {
        await next();

        if (ctx.__connection) {
            ctx.__connection = null;
        }

        if (ctx.result) {
            // 组装正确返回结果
            ctx.body = {
                code: 200,
                message: ctx.msg || 'success',
                result: ctx.result || {}
            };
        }
    } catch (err) {
        console.error(err.stack);

        if (ctx.__connection) {
            try {
                // 回滚事务
                await db.rollbackTransaction(ctx.__connection);
            } catch (rollbackErr) {
                console.error(rollbackErr.stack);
            } finally {
                ctx.__connection = null;
            }
        }

        ctx.body = {
            code: err.statusCode || err.status || 500,
            message: err.message || err.name || 'unknown error'
        };
    }
});

// cors
app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    await next();
});

// filter & controller
let filterPath = path.join(__dirname, './filter');
let controllerPath = path.join(__dirname, './controller');

[filterConfig, controllerConfig].forEach((config, index) => {
    Object.keys(config).forEach(key => {
        let actions = config[key];
        actions = Array.isArray(actions) ? actions : [actions];

        key = key.split(' ');
        let method = key[0].toLowerCase();
        let url = key[1];

        let dirPath = index === 0 ? filterPath : controllerPath;

        actions.forEach(action => {
            if (typeof action === 'string') {
                action = action.split('.');
                action = require(path.join(dirPath, action[0]))[action[1]];
            }

            router[method](url, action);
        })
    });
});
app.use(router.routes());

// error handle
app.on('error', (err, ctx) => {
    console.error(err.stack);

    if (ctx.__connection) {
        // 回滚事务
        db.rollbackTransaction(ctx.__connection)
            .then(() => {
                ctx.__connection = null;
            })
            .catch(rollbackErr => {
                ctx.__connection = null;
                console.error(rollbackErr.stack);
            });
    }
});

app.listen(3000);
console.log('running on port:' + 3000);

module.exports = app;
