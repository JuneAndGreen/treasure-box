'use strict';

var __PARSE__ = (function() {
  
  var hasOwnProperty = ({}).hasOwnProperty;
  var varsRecord = {}; // 模板引用到的变量
  
  /*
   * 语法正则
   */
  var regmap = [
    // if语句开始
    {reg: /^if\s+(.+)/i, val: function(all, condition) {
      parseVar(condition);
      return 'if(' + condition + ') {';
    }},
    // elseif 语句开始
    {reg: /^elseif\s+(.+)/i, val: function(all, condition) {
      parseVar(condition);
      return '} else if(' + condition + ') {';
    }},
    // else语句结束
    {reg: /^else/i, val: '} else {'},
    // if语句结束
    {reg: /^\/\s*if/i, val: '}'},
    // list语句开始
    {reg: /^list\s+([\S]+)\s+as\s+([\S]+)/i, val: function(all, arr, item) {
      parseVar(arr);
      return 'for(var __INDEX__=0;__INDEX__<' + arr + '.length;__INDEX__++) {var ' + item + '=' + arr + '[__INDEX__];var ' + item + '_index=__INDEX__;';
    }},
    // list语句结束
    {reg: /^\/\s*list/i, val: '}'},
    // var 语句
    {reg: /^var\s+(.+)/i, val: function(all, expr) {
      parseVar(expr);
      return 'var ' + expr + ';';
    }}
  ];

  /**
   * 解析变量并登记
   */
  var parseVar = (function() {
    var regForObjOrArr = /^\s*[\[\{'"].*?[\]\}'"]\s*$/;
    var regForOpr = /[\&\|\<\>\+\-\*\/\%\,\(\)\[\]\?\:\!\=\;]/;
    var regForKeyWord = /^(?:defined|null|undefined|true|false|instanceof|new|this|typeof|[\d]+)$/i;
    var regForNew = /^new\s+/;
    var regForStr = /['"]/;

    return function(content) {
      content = content || '';
      if(!content || regForObjOrArr.test(content)) return; // 字符串\数组\对象，直接返回

      var arr = content.split(regForOpr); // 按照操作符进行分隔
      for(var i=0,len=arr.length; i < len; i++) {
        var value = arr[i];

        if(regForObjOrArr.test(value)) continue; // 字符串\数组\对象
        value = value.split('.')[0].trim(); // 去除方法调用
        if(!value || regForStr.test(value)) continue; // 字符串
        value = value.replace(regForNew, ''); // 去除开头的new关键字
        if(regForKeyWord.test(value)) continue; // 检测到关键字

        varsRecord[value] = true; // 变量登记
      } 
    };
  })();

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

  /*
   * 解析模板
   */
  var doParseTemplate = function(content, data, filter) {
    content = content.replace(/\t/g, '  ').replace(/\n/g, '\\n').replace(/\r/g, '\\r');

    // 初始化模板生成器结构
    var out = [];
    var struct = [
      'try { var OUT = [];DATA=DATA||{};FILTER=FILTER||{};',
      '', // 放置默认过滤器声明占位符
      '', // 放置变量声明占位符
      '', // 放置模板生成器占位符
      'return OUT.join(\'\'); } catch(e) { throw e; }'
    ];

    // 初始化默认filter
    var filters = [];
    for(var key in defaultFilter) {
      if(hasOwnProperty.call(defaultFilter, key)) {
        filters.push('FILTER[\'' + key + '\']=' + defaultFilter[key].toString() + ';');
      }
    }
    struct[1] = filters.join('');

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
        out.push('OUT.push(\'' + preCode.substr(0, preCode.length-1) + '\');');
        stmJs = content.substring(stmbeg + 1, stmend);

        // 处理过滤器
        var tmp = '';
        stmJs.split('|').forEach(function(item, index) {
          if(index === 0) {
            // 变量，强制转码
            parseVar(item);
            tmp = item;
          } else {
            // 过滤器
            var farr = item.split(':');
            tmp = 'FILTER[\'' + farr[0] + '\'](' + tmp;

            if(farr[1]) {
              // 带变量的过滤器
              farr[1].split(',').forEach(function(fitem) {
                parseVar(fitem);
                tmp = tmp + ', ' + fitem;
              }); 
            }

            tmp = tmp + ')'; // 追加结尾
          }
        });

        out.push('OUT.push((' + tmp + ').toString());');
      } else {
        // 针对js语句
        out.push('OUT.push(\'' + preCode + '\');');
        stmJs = content.substring(stmbeg + 1, stmend);
        out.push(transStm(stmJs));
      }
      beg = stmend + 1;
    }

    // 合并内容
    struct[3] = out.join('');

    // 追加变量声明
    var varsArr = [];
    for(var key in varsRecord) {
      if(hasOwnProperty.call(varsRecord, key)) {
        varsArr.push(key + '=DATA[\'' + key + '\']');
      }
    }
    varsArr.join(',');
    if(varsArr.length) struct[2] = 'var ' + varsArr.join(',') + ';';

    return new Function('DATA', 'FILTER', struct.join(''));
  };
  
  return {
    /**
     * 解析模板生成代码生成器
     */
    parse: doParseTemplate,
    /**
     * 根据模板数据生成代码
     */
    generate: function(content, data, filter) {
      try {
        data = data||{};
        // 解析模板生成代码生成器
        var f = doParseTemplate(content);
        return f(data, filter);
      } catch(ex) {
        return ex.stack;
      }
    }
  }
})();

if(typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = __PARSE__;
} else {
  window.tpl = __PARSE__;
}