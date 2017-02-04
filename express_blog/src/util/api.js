var winston = require('winston');
var path = require('path');
var fs = require('fs');

var logsDir = path.join(__dirname, '../logs/');
try {
  fs.accessSync(logsDir);
} catch(err) {
  fs.mkdirSync(logsDir); // create logs dir
}
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (require('winston-daily-rotate-file'))({ 
      filename: path.join(__dirname, '../../logs/', '_blog.log'),
      datePattern: 'yyyy-MM-dd',
      prepend: true
    })
  ]
});

module.exports = {
  /**
   * 日志相关api
   */
  log: function() {
    logger.info.apply(logger, arguments);
  },
  warn: function() {
    logger.warn.apply(logger, arguments);
  },
  error: function() {
    logger.error.apply(logger, arguments);
  },
  /**
   * 验证数据
   */
  validate: (function() {
    var rmap = {
      // 判断当前字段是否必须
      required: function(val, rval) {
        return !rval || val !== undefined;
      },
      // 判断值是否符合正则
      value: function(val, rval) {
        if(val === undefined) return true;
        if(!(rval instanceof RegExp)) return false;

        if(val instanceof Array) {
          for(var i=0,len=val.length; i<len; i++) {
            var item = val[i];
            if(!rval.test('' + item)) return false;
          }
          return true;
        }

        return rval.test('' + val);
      },
      // 判断值是否是数字
      isNumber: function(val, rval) {
        var flag = !rval || (typeof val === 'number' && !isNaN(val)) || /\d+/.test(val);
        if(flag) {
          return function(val) {
            return parseInt(val, 10);
          };
        } else {
          return flag;
        }
      },
      // 判断值是否是数组
      isArray: function(val, rval) {
        return !rval || val instanceof Array;
      },
      // 判断值是否是布尔值
      isBoolean: function(val, rval) {
        var flag = !rval || typeof val === 'boolean' || /(true|false)/.test(val);
        if(flag) {
          return function(val) {
            return ('' + val).trim().toLowerCase() === 'true';
          };
        } else {
          return flag;
        }
      }
    };
    return function(data, rules) {
      // 对数据中每个字段进行验证
      var ret = {};
      var keys = Object.keys(rules);
      for(var i=0,len=keys.length; i<len; i++) {
        var key = keys[i];
        var val = data[key];
        var rule = rules[key];
        if(val === undefined) {
          // 当数据不带有对应字段时
          if(!rule.required) continue;
          else return {
            field: key, // 第一个检测到失败的名称
            success: false,
            msg: 'missing required value for ' + key
          };
        }

        ret[key] = val;
        // 对每个字段的逐条规则进行验证
        var rkeys = Object.keys(rule);
        for(var j=0,rlen=rkeys.length; j<rlen; j++) {
          var rkey = rkeys[j];
          var rval = rule[rkey];
          var flag = rmap[rkey](val, rval);
          if(!flag) {
            return {
              field: key, // 第一个检测到失败的名称
              success: false,
              msg: 'invalid parameter value for ' + key
            };
          }
          if(typeof flag === 'function') {
            // 需要做值转换
            ret[key] = flag(ret[key]);
          }
        }
      }
      return {
        data: ret, // 返回根据传入的规则得出的数据，只收集规则对象中出现过的字段(无视传入数据有但是规则中没有的字段)
        success: true, // 是否合法
      };
    };
  })(),

  /**
   * 返回码
   */
  resPkg: (function() {
    var codeMap = {
      SUCCESS: [200, '成功'],

      PARAMERR: [400, '参数错误'],

      USEREXISTS: [320, '用户名已存在'],
      USERNOTEXISTS: [321, '用户名不存在'],
      PWDERR: [322, '密码错误'],

      SERVERERR: [500, '服务器错误'],

      UNKNOW: [800, '未知错误'],
    };

    return function(code, result, msg) {
      return {
        code: codeMap[code]&&codeMap[code][0] || codeMap['UNKNOW'][0],
        result: result || [],
        msg: msg || codeMap[code]&&codeMap[code][1] || codeMap['UNKNOW'][1] || ''
      };
    };
  })()
};