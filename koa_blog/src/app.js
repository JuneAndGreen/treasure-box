'use strict';

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

const koa = require('koa');
const session = require('koa-session');
const bodyParser = require('koa-body');
const staticDir = require('koa-static');
const render = require('koa-ejs');

const db = require('./util/db');
const _ = require('./util/api');
const wrapRouter = require('./util/router');

const resPkg = _.resPkg;

/**
 * 异常控制
 */
function* errFunc(err) {
  console.log(err.stack);

  let resFunc = function(err) {
      if(this.__connection) delete this.__connection;

      err = typeof err === 'string' ? err : 'SERVER_ERROR';
      this.response.body = resPkg(err);
  };

  if(this.__connection) {
      // 如果存在未释放的连接，进行事务回滚并释放连接
      try {
          yield db.rollbackTransaction(this.__connection);
      } catch(rollbackErr) {
          // 回滚失败
          console.log(rollbackErr.stack);
      } finally {
          resFunc.call(this, err);
      }
  } else {
      resFunc.call(this, err);
  }
}

class Server extends EventEmitter {
  constructor() {
    super();
    this.app = koa();

    this.init();
  }
  /**
   * 初始化
   */
  init() {
    // view egine
    render(this.app, {
      root: path.join(__dirname, './views'),
      layout: false,
      viewExt: 'ejs',
      cache: true,
      debug: false
    });

    // static dir
    this.app.use(staticDir(path.join(__dirname, '../webapp')));

    // bodyParser
    let bodyOpt = {
      strict: false
    };
    // 存在文件上传的情况
    let uploadDir = path.join(__dirname, './uploads');
    try {
      fs.accessSync(uploadDir);
    } catch(ex) {
      fs.mkdirSync(uploadDir);
    }

    bodyOpt = Object.assign({
      multipart: true,
      formidable: {uploadDir},
      strict: false
    }, bodyOpt);
    this.app.use(bodyParser(bodyOpt));

    // session
    this.app.keys = ['THIS IS A SECRECT'];
    this.app.use(session(this.app));

    // xhr or view error
    this.app.use(function*(next) {
      try {
        yield next;
      } catch(err) {
        yield *errFunc.call(this, err);
      }
    });

    // filter & controller
    let filterPath = path.join(__dirname, './filter');
    let controllerPath = path.join(__dirname, './controller');

    let rArr = [filterPath, controllerPath];
    for(let dirpath of rArr) {
      let routes = [];
      if(dirpath) {
        let stat = fs.statSync(dirpath);
        if(!stat.isDirectory()) return;

        let subs = fs.readdirSync(dirpath);
        for(let file of subs) {
          let filePath = path.join(dirpath, file);
          if(fs.statSync(filePath).isFile() && path.extname(filePath) === '.js') {
            routes.push(require(filePath));
          }
        }

        for(let route of routes) {
          if(typeof route === 'object') {
            route = wrapRouter(route);
            this.app.use(route.routes())
                    .use(route.allowedMethods());
          }
        }
      }
    }

    // error handle
    this.app.on('error', (err, ctx) => this.emit('error', err, ctx));
  }
  /**
   * 监听
   */
  listen(port) {
    port = port || '3000';
    this.app.listen(port);
    console.log(`listening on port: ${port}`);

    return this;
  }
}

new Server().listen().on('error', (err, ctx) => {
  console.log('--------------------------------------');
  console.log(err);
  console.log(ctx);
  console.log('--------------------------------------');
});
