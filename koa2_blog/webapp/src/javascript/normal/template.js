window.parseTpl = (function() {
    var regmap = [
        // if语句开始
        {reg: /^if\s+(.+)/i, val: function(all, condition) {return 'if(' + condition + ') {';}},
        // elseif 语句开始
        {reg: /^elseif\s+(.+)/i, val: function(all, condition) {return '} else if(' + condition + ') {';}},
        // else语句结束
        {reg: /^else/i, val: '} else {'},
        // if语句结束
        {reg: /^\/\s*if/i, val: '}'},
        // list语句开始
        {reg: /^list\s+([\S]+)\s+as\s+([\S]+)/i, val: function(all, arr, item) {return 'for(var __INDEX__=0;__INDEX__<' + arr + '.length;__INDEX__++) {var ' + item + '=' + arr + '[__INDEX__];var ' + item + '_index=__INDEX__;';}},
        // list语句结束
        {reg: /^\/\s*list/i, val: '}'},
        // var 语句
        {reg: /^var\s+(.+)/i, val: function(all, expr) {return 'var ' + expr + ';';}}
    ];
    /*
     * 转换模板语句
     */
    var transStm = function(stmJs) {
        stmJs = stmJs.trim();
        for(var i=0; i<regmap.length; i++) {
            var item = regmap[i];
            if(item.reg.test(stmJs)) {
                return (typeof item.val === 'function') ? stmJs.replace(item.reg, item.val) : item.val;
            }
        }
    };

    /*
     * 解析模板
     */
    var doParseTemplate = function(content, data) {
        content = content.replace(/\t/g, '  ').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        // 初始化模板生成器结构
        var struct = [
            'try { var OUT = [];',
            '', //放置模板生成器占位符
            'return OUT.join(\'\'); } catch(e) { throw new Error("parse template error!"); }'
        ];
        // 初始化模板变量
        var vars = [];
        Object.keys(data).forEach(function(name) {
            if(typeof data[name] === 'string') {
                data[name] = '\'' + data[name] + '\'';
            }
            var tmp = typeof data[name] === 'object' ? JSON.stringify(data[name]) : data[name];
            vars.push('var ' + name + ' = ' + tmp + ';');
        });
        vars = vars.join('');
        // 解析模板内容
        var out = [];
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
                out.push('OUT.push((' + stmJs + ').toString());');
            } else {
                // 针对js语句
                out.push('OUT.push(\'' + preCode + '\');');
                stmJs = content.substring(stmbeg + 1, stmend);
                out.push(transStm(stmJs));
            }
            beg = stmend + 1;
        }
        out.unshift(vars);
        struct[1] = out.join('');
        return new Function('DATA', struct.join(''));
    };
    /**`
     * 根据模板数据生成代码
     * @method 
     */
    return function(content, data){
        try{
            data = data||{};
            // 解析模板生成代码生成器
            var f = doParseTemplate(content, data);
            return f(data);
        }catch(ex){
            return -1;
        }
    };
})();