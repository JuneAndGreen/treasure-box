'use strict';

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');

const logDir = path.join(__dirname, '../logs/');

try {
    fs.accessSync(logDir);
} catch(err) {
    fs.mkdirSync(logDir);
}

// 格式化输出日志
function formatter(options) {
    return `[${options.level.toUpperCase()}][${(new Date).toLocaleString()}] -- ${options.message || ''}`;
}

// 日志文件
let transports = [new winstonDaily({ 
    filename: path.join(logDir, '_koa2_blog.log'),
    datePattern: 'yyyy-MM-dd',
    prepend: true,
    json: false,
    formatter
})];

// console
transports.unshift(new (winston.transports.Console)({ formatter }));

module.exports = new (winston.Logger)({ transports });
