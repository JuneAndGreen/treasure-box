'use strict'

const ParamIllegalError = require('../error/index').ParamIllegalError;

module.exports = {
	/**
	 * 格式化时间
	 */
	format(time, reg) {
		let date = typeof time === 'string' ? new Date(time) : time;
		let map = {};
		map.yyyy = date.getFullYear();
		map.yy = ('' + map.yyyy).substr(2);
		map.M = date.getMonth() + 1;
		map.MM = (map.M < 10 ? '0' : '') + map.M;
		map.d = date.getDate();
		map.dd = (map.d < 10 ? '0' : '') + map.d;
		map.H = date.getHours();
		map.HH = (map.H < 10 ? '0' : '') + map.H;
		map.m = date.getMinutes();
		map.mm = (map.m < 10 ? '0' : '') + map.m;
		map.s = date.getSeconds();
		map.ss = (map.s < 10 ? '0' : '') + map.s;

		return reg.replace(/\byyyy|yy|MM|M|dd|d|HH|H|mm|m|ss|s\b/g, $1 => {
			return map[$1];
		});
	},

	/**
     * 验证数据
     */
    validate: (function() {
        const rmap = {
            // 判断当前字段是否必须
            required(val, rval) {
                return !rval || val !== undefined;
            },
            // 判断值是否符合正则
            value(val, rval) {
                if (val === undefined) return true;
                if (!(rval instanceof RegExp)) return false;

                if (val instanceof Array) {
                    for (let item of val) {
                        if (!rval.test('' + item)) return false;
                    }
                    return true;
                }

                return rval.test('' + val);
            },
            // 判断值是否是数字
            isNumber(val, rval) {
                let flag = !rval || (typeof val === 'number' && !isNaN(val)) || /\d+/.test(val);
                if (flag) {
                    return val => {
                        return parseInt(val, 10);
                    };
                } else {
                    return flag;
                }
            },
            // 判断值是否是数组
            isArray(val, rval) {
                return !rval || val instanceof Array;
            },
            // 判断值是否是布尔值
            isBoolean(val, rval) {
                let flag = !rval || typeof val === 'boolean' || /(true|false)/.test(val);
                if (flag) {
                    return val => {
                        return ('' + val).trim().toLowerCase() === 'true';
                    };
                } else {
                    return flag;
                }
            }
        };
        return (data, rules) => {
            // 对数据中每个字段进行验证
            let ret = {};
            let keys = Object.keys(rules);
            for (let key of keys) {
                let val = data[key];
                let rule = rules[key];
                if (val === undefined) {
                    // 当数据不带有对应字段时
                    if (!rule.required) {
                        if (rule.default !== undefined) ret[key] = rule.default; // 默认值

                        continue;
                    } else {
                        throw new ParamIllegalError(`missing required value for ${key}`);
                    };
                }

                ret[key] = val;
                // 对每个字段的逐条规则进行验证
                let rkeys = Object.keys(rule);
                for (let rkey of rkeys) {
                    let rval = rule[rkey];

                    if (rmap[rkey]) {
                        let flag = rmap[rkey](val, rval);
                        if (!flag) {
                            throw new ParamIllegalError(`invalid parameter value for ${key}`);
                        }
                        if (typeof flag === 'function') {
                            // 需要做值转换
                            ret[key] = flag(ret[key]);
                        }
                    }
                }
            }

            // 返回根据传入的规则得出的数据，只收集规则对象中出现过的字段(无视传入数据有但是规则中没有的字段)
            return ret;
        };
    })(),
};