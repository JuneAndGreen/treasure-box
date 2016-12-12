'use strict';

var __PARSE__ = (function() {
  
  var hasOwnProperty = ({}).hasOwnProperty;
  
  /*
   * 语法正则
   */
  var regmap = [
    // if语句开始
    {reg: /^if\s+(.+)/i, val: function(all, condition) {return `if(${condition}) {`;}},
    // elseif 语句开始
    {reg: /^elseif\s+(.+)/i, val: function(all, condition) {return `} else if(${condition}) {`}},
    // else语句结束
    {reg: /^else/i, val: '} else {'},
    // if语句结束
    {reg: /^\/\s*if/i, val: '}'},
    // list语句开始
    {reg: /^list\s+([\S]+)\s+as\s+([\S]+)/i, val: function(all, arr, item) {return `for(var __INDEX__=0;__INDEX__<${arr}.length;__INDEX__++) {var ${item}=${arr}[__INDEX__];var ${item}_index=__INDEX__;`;}},
    // list语句结束
    {reg: /^\/\s*list/i, val: '}'},
    // var 语句
    {reg: /^var\s+(.+)/i, val: function(all, expr) {return `var ${expr};`;}}
  ];

  /**
   * 默认的过滤器
   */
  var defaultFilter = {
    // 防注入用
    escape: function(str) {
      // 防注入转码映射表
      var escapeMap = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        ' ': '&nbsp;',
        '"': '&quot;',
        "'": '&#39;',
        '\n': '<br/>',
        '\r': ''
      };

      return str.replace(/\<|\>|\&|\r|\n|\s|\'|\"/g, function(one) {
        return escapeMap[one];
      });
    }
  };

  /*
   * 转换模板语句
   */
  var transStm = function(stmJs) {
    stmJs = stmJs.trim();
    for(var key in regmap) {
      if(hasOwnProperty.call(regmap, key)) {
        var item = regmap[key];
        if(item.reg.test(stmJs)) {
          return (typeof item.val === 'function') ? stmJs.replace(item.reg, item.val) : item.val;
        }
      }
    }
  };

  /**
   * 合并对象
   */
  var merge = function(o1, o2) {
    var ret = {};
    for(var k1 in o1) ret[k1] = o1[k1];
    for(var k2 in o2) ret[k2] = o2[k2];

    return ret;
  };

  /*
   * 解析模板
   */
  var doParseTemplate = function(content, data, filter) {
    content = content.replace(/\t/g, '  ').replace(/\n/g, '\\n').replace(/\r/g, '\\r');

    // 初始化模板生成器结构
    var out = [];
    var struct = [
      'try { var OUT = [];',
      '', //放置模板生成器占位符
      'return OUT.join(\'\'); } catch(e) { throw e; }'
    ];

    // 初始化模板变量
    var vars = [];
    Object.keys(data).forEach(function(name) {
      vars.push(`var ${name} = DATA['${name}'];`);
    });
    out.push(vars.join(''));

    // 初始化过滤器
    var filters = ['var FILTERS = {};'];
    Object.keys(filter).forEach(function(name) {
      if(typeof filter[name] === 'function') {
        filters.push(`FILTERS['${name}'] = FILTER['${name}'];`);
      }
    });
    out.push(filters.join(''));

    // 解析模板内容
    var beg = 0; // 解析文段起始位置
    var stmbeg = 0;  // 表达式起始位置
    var stmend = 0; // 表达式结束位置
    var len = content.length;
    var preCode = ''; // 表达式前的代码
    var endCode = ''; // 最后一段代码
    var stmJs = ''; // 表达式
    while(beg < len) {
      /* 开始符 */
      stmbeg = content.indexOf('{', beg);
      while(content.charAt(stmbeg - 1) === '\\') {
        // 遇到转义的情况
        stmbeg = content.indexOf('{', stmbeg + 1);
      }
      if(stmbeg === -1) {
        // 到达最后一段代码
        endCode = content.substr(beg);
        out.push('OUT.push(\'' + endCode + '\');');
        break;
      }

      /* 结束符 */
      stmend = content.indexOf('}', stmbeg);
      while(content.charAt(stmend - 1) === '\\') {
        // 遇到转义的情况
        stmend = content.indexOf('}', stmend + 1);
      }
      if(stmend === -1) {
        // 没有结束符
        break;
      }

      // 开始符之前代码 
      preCode = content.substring(beg, stmbeg);

      if(content.charAt(stmbeg - 1) === '$') {
        // 针对变量取值
        out.push(`OUT.push(\'${preCode.substr(0, preCode.length-1)}\');`);
        stmJs = content.substring(stmbeg + 1, stmend);

        // 处理过滤器
        var tmp = '';
        stmJs.split('|').forEach(function(item, index) {
          if(index === 0) {
            // 变量，强制转码
            tmp = item;
          } else {
            // 过滤器
            var farr = item.split(':');
            tmp = `FILTERS['${farr[0]}'](${tmp}`;

            if(farr[1]) {
              // 带变量的过滤器
              farr[1].split(',').forEach(function(fitem) {
                tmp = `${tmp}, ${fitem}`;
              }); 
            }

            tmp = `${tmp})`; // 追加结尾
          }
        });

        out.push(`OUT.push((${tmp}).toString());`);
      } else {
        // 针对js语句
        out.push(`OUT.push(\'${preCode}\');`);
        stmJs = content.substring(stmbeg + 1, stmend);
        out.push(transStm(stmJs));
      }
      beg = stmend + 1;
    }

    // 合并内容
    struct[1] = out.join('');
    return new Function('DATA', 'FILTER', struct.join(''));
  };
  /**`
   * 根据模板数据生成代码
   */
  return function(content, data, filter) {
    try {
      data = data||{};
      filter = merge(defaultFilter, filter);
      // 解析模板生成代码生成器
      var f = doParseTemplate(content, data, filter);
      return f(data, filter);
    } catch(ex) {
      return ex.stack;
    }
  };
})();

if(typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = __PARSE__;
} else {
  window.parse = __PARSE__;
}