'use strict'

module.exports = {
	/**
	 * 格式化时间
	 */
	format: function(time, reg) {
		let date = typeof time === 'string' ? new Date(time) : time;
		let map = {};
		map.yyyy = date.getFullYear();
		map.yy = ('' + map.yyyy).substr(2);
		map.M = date.getMonth() + 1
		map.MM = (map.M < 10 ? '0' : '') + map.M;
		map.d = date.getDate();
		map.dd = (map.d < 10 ? '0' : '') + map.d;
		map.H = date.getHours();
		map.HH = (map.H < 10 ? '0' : '') + map.H;
		map.m = date.getMinutes();
		map.mm = (map.m < 10 ? '0' : '') + map.m;
		map.s = date.getSeconds();
		map.ss = (map.s < 10 ? '0' : '') + map.s;

		return reg.replace(/\byyyy|yy|MM|M|dd|d|HH|H|mm|m|ss|s\b/g, function($1) {
			return map[$1];
		});
	},

	/**
	 * 验证数据
	 */
	validate: (function() {
		let rmap = {
	    // 判断当前字段是否必须
	    required: function(val, rval) {
	      return !rval || val !== undefined;
	    },
	    // 判断值是否符合正则
	    value: function(val, rval) {
	      if(val === undefined) return true;
	      if(!(rval instanceof RegExp)) return false;

	      if(val instanceof Array) {
	        for(let item of val) {
	          if(!rval.test('' + item)) return false;
	        }
	        return true;
	      }

	      return rval.test('' + val);
	    },
	    // 判断值是否是数字
	    isNumber: function(val, rval) {
	      let flag = !rval || (typeof val === 'number' && !isNaN(val)) || /\d+/.test(val);
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
	      let flag = !rval || typeof val === 'boolean' || /(true|false)/.test(val);
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
	    let ret = {};
	    let keys = Object.keys(rules);
	    for(let key of keys) {
	      let val = data[key];
	      let rule = rules[key];
	      if(val === undefined) {
	        // 当数据不带有对应字段时
	        if(!rule.required) continue;
	        else return {
	          field: key, // 第一个检测到失败的名称
	          success: false,
	          msg: `missing required value for ${key}`
	        };
	      }

	      ret[key] = val;
	      // 对每个字段的逐条规则进行验证
	      let rkeys = Object.keys(rule);
	      for(let rkey of rkeys) {
	        let rval = rule[rkey];
	        let flag = rmap[rkey](val, rval);
	        if(!flag) {
	          return {
	            field: key, // 第一个检测到失败的名称
	            success: false,
	            msg: `invalid parameter value for ${key}`
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
		let codeMap = {
		  SUCCESS: [200, '成功'],

		  PARAMERR: [310, '参数错误'],
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
		    msg: msg || codeMap[code]&&codeMap[code][1] || ''
		  };
		};
	})(),

	/**
	 * 将驼峰式转成下划线连接
	 */
	toUnderline: function(str) {
	  return str.replace(/[A-Z]/g, function(all) {
	    return '_' + all.toLowerCase();
	  });
	},

	/**
	 * 将下划线连接的字段转成驼峰式
	 */
	toCamel: function(str) {
	  return str.replace(/_([a-zA-Z])/g, function(all, $1) {
	    return $1.toUpperCase();
	  });
	},

	/**
	 * 将带回调的函数包装成promise
	 * 使用过程需要保证被包装的函数中回调是最后一个函数，并且其回调函数只接收两个参数，其一是异常对象，其二是返回数据。
	 *
	 * 如下使用：
	 * wa(function(str1, str2, cb) {
	 *   // 最后一个参数是回调
	 *   dosth(str1, str2, function(err, ret1, ret2) {
	 *     cb(err, ret1); // 回调中只接收两个参数，第一个是异常对象，第二个是返回数据
	 *   });
	 * });
	 *
	 */
	wa: function(func, scope) {
	  return function() {
	    let args;
	    if(!arguments.length) {
	      args = [];
	    } else {
	      args = [].slice.call(arguments);
	      let temp = args.pop();
	      if(typeof temp !== 'function') {
	        args.push(temp);
	      }
	    }

	    return new Promise(function(resolve, reject) {
	    	args.push(function(err, data) {
	        if(err) reject(err);
	        else resolve(data);
	      });

	      func.apply((scope || null), args);
	    });
	  };
	}
};