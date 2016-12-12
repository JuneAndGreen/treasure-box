'use strict';

var __PARSE__ = (function() {
  /*
   * 语法正则
   */
  const regmap = [
    // if语句开始
    {reg: /^if\s+(.+)/i, val: (all, condition) => {return `if(${condition}) {`;}},
    // elseif 语句开始
    {reg: /^elseif\s+(.+)/i, val: (all, condition) => {return `} else if(${condition}) {`}},
    // else语句结束
    {reg: /^else/i, val: '} else {'},
    // if语句结束
    {reg: /^\/\s*if/i, val: '}'},
    // list语句开始
    {reg: /^list\s+([\S]+)\s+as\s+([\S]+)/i, val: (all, arr, item) => {return `for(var __INDEX__=0;__INDEX__<${arr}.length;__INDEX__++) {var ${item}=${arr}[__INDEX__];var ${item}_index=__INDEX__;`;}},
    // list语句结束
    {reg: /^\/\s*list/i, val: '}'},
    // var 语句
    {reg: /^var\s+(.+)/i, val: (all, expr) => {return `var ${expr};`;}}
  ];

  /**
   * 默认的过滤器
   */
  const defaultFilter = {
    // 防注入用
    escape: (str) => {
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

      return str.replace(/\<|\>|\&|\r|\n|\s|\'|\"/g, (one) => {
        return escapeMap[one];
      });
    }
  };

  /*
   * 转换模板语句
   */
  let transStm = function(stmJs) {
    stmJs = stmJs.trim();
    for(let item of regmap) {
      if(item.reg.test(stmJs)) {
        return (typeof item.val === 'function') ? stmJs.replace(item.reg, item.val) : item.val;
      }
    }
  };

  /*
   * 解析模板
   */
  let doParseTemplate = function(content, data, filter) {
    content = content.replace(/\t/g, '  ').replace(/\n/g, '\\n').replace(/\r/g, '\\r');

    // 初始化模板生成器结构
    let out = [];
    let struct = [
      'try { var OUT = [];',
      '', //放置模板生成器占位符
      'return OUT.join(\'\'); } catch(e) { throw e; }'
    ];

    // 初始化模板变量
    let vars = [];
    Object.keys(data).forEach((name) => {
      vars.push(`var ${name} = DATA['${name}'];`);
    });
    out.push(vars.join(''));

    // 初始化过滤器
    let filters = ['var FILTERS = {};'];
    Object.keys(filter).forEach((name) => {
      if(typeof filter[name] === 'function') {
        filters.push(`FILTERS['${name}'] = FILTER['${name}'];`);
      }
    });
    out.push(filters.join(''));

    // 解析模板内容
    let beg = 0; // 解析文段起始位置
    let stmbeg = 0;  // 表达式起始位置
    let stmend = 0; // 表达式结束位置
    let len = content.length;
    let preCode = ''; // 表达式前的代码
    let endCode = ''; // 最后一段代码
    let stmJs = ''; // 表达式
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
        let tmp = '';
        stmJs.split('|').forEach((item, index) => {
          if(index === 0) {
            // 变量，强制转码
            tmp = item;
          } else {
            // 过滤器
            let farr = item.split(':');
            tmp = `FILTERS['${farr[0]}'](${tmp}`;

            if(farr[1]) {
              // 带变量的过滤器
              farr[1].split(',').forEach((fitem) => {
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
      filter = Object.assign({}, defaultFilter, filter);
      // 解析模板生成代码生成器
      let f = doParseTemplate(content, data, filter);
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