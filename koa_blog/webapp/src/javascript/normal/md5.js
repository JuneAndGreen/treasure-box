/**
 * MD5编码数据输出十六进制串
 */
window.md52hex = (function() {
  // bits per input character. 8 - ASCII; 16 - Unicode
  var __chrsz = 8;
  /**
   * Bitwise rotate a 32-bit number to the left.
   */
  var __rol = function(_number,_count){
    return (_number<<_count)|(_number>>>(32-_count));
  };
  /**
   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
   * to work around bugs in some JS interpreters.
   */
  var __add = function(x,y){
    var _lsw = (x&0xFFFF)+(y&0xFFFF),
        _msw = (x>>16)+(y>>16)+(_lsw>>16);
    return (_msw<<16)|(_lsw&0xFFFF);
  };
  /**
   * Convert an 8-bit or 16-bit string to an array of big-endian or little-endian words
   */
  var __str2bin = (function(){
    var _lmove = function(i){return i%32;},
        _bmove = function(i){return 32-__chrsz-i%32;};
    return function(_str,_little){
      var _bin  = [],
          _mask = (1<<__chrsz)-1,
          _move = _little?_lmove:_bmove;
      for (var i=0,l=_str.length*__chrsz;i<l;i+=__chrsz)
        _bin[i>>5] |= (_str.charCodeAt(i/__chrsz)&_mask)<<_move(i);
      return _bin;
    };
  })();
  /**
   * Convert an array of big-endian or little-endian words to a hex string.
   */
  var __bin2hex = (function(){
    // hex output table.
    var _hextab = '0123456789abcdef',
        _lmove  = function(i){return i%4;},
        _bmove  = function(i){return 3-i%4;};
    return function(_binarray,_little){
      var _arr = [],
          _move = _little?_lmove:_bmove;
      for(var i=0,l=_binarray.length*4;i<l;i++){
        _arr.push(_hextab.charAt((_binarray[i>>2]>>(_move(i)*8+4))&0xF)
          +_hextab.charAt((_binarray[i>>2]>>(_move(i)*8))&0xF));
      }
      return _arr.join('');
    };
  })();
  /**
   * These functions implement the four basic operations the algorithm uses.
   */
  var __md5cm = function(q,a,b,x,s,t){
    return __add(__rol(__add(__add(a,q),__add(x,t)),s),b);
  };
  var __md5ff = function(a,b,c,d,x,s,t){
    return __md5cm((b&c)|((~b)&d),a,b,x,s,t);
  };
  var __md5gg = function(a,b,c,d,x,s,t){
    return __md5cm((b&d)|(c&(~d)),a,b,x,s,t);
  };
  var __md5hh = function(a,b,c,d,x,s,t){
    return __md5cm(b^c^d,a,b,x,s,t);
  };
  var __md5ii = function(a,b,c,d,x,s,t){
    return __md5cm(c^(b|(~d)),a,b,x,s,t);
  };
  /**
   * Calculate the MD5 of an array of little-endian words, and a bit length
   */
  var __data2md5  = function(x,y){
    x[y>>5] |= 0x80<<((y)%32);
    x[(((y+64)>>>9)<<4)+14] = y;
    var a = 1732584193,
        b = -271733879,
        c = -1732584194,
        d = 271733878;
    for(var i=0,l=x.length,_oa,_ob,_oc,_od;i<l;i+=16) {
        _oa = a; _ob = b; _oc = c; _od = d;
        a = __md5ff(a, b, c, d, x[i+ 0], 7 , -680876936);
        d = __md5ff(d, a, b, c, x[i+ 1], 12, -389564586);
        c = __md5ff(c, d, a, b, x[i+ 2], 17,  606105819);
        b = __md5ff(b, c, d, a, x[i+ 3], 22, -1044525330);
        a = __md5ff(a, b, c, d, x[i+ 4], 7 , -176418897);
        d = __md5ff(d, a, b, c, x[i+ 5], 12,  1200080426);
        c = __md5ff(c, d, a, b, x[i+ 6], 17, -1473231341);
        b = __md5ff(b, c, d, a, x[i+ 7], 22, -45705983);
        a = __md5ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
        d = __md5ff(d, a, b, c, x[i+ 9], 12, -1958414417);
        c = __md5ff(c, d, a, b, x[i+10], 17, -42063);
        b = __md5ff(b, c, d, a, x[i+11], 22, -1990404162);
        a = __md5ff(a, b, c, d, x[i+12], 7 ,  1804603682);
        d = __md5ff(d, a, b, c, x[i+13], 12, -40341101);
        c = __md5ff(c, d, a, b, x[i+14], 17, -1502002290);
        b = __md5ff(b, c, d, a, x[i+15], 22,  1236535329);
        a = __md5gg(a, b, c, d, x[i+ 1], 5 , -165796510);
        d = __md5gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
        c = __md5gg(c, d, a, b, x[i+11], 14,  643717713);
        b = __md5gg(b, c, d, a, x[i+ 0], 20, -373897302);
        a = __md5gg(a, b, c, d, x[i+ 5], 5 , -701558691);
        d = __md5gg(d, a, b, c, x[i+10], 9 ,  38016083);
        c = __md5gg(c, d, a, b, x[i+15], 14, -660478335);
        b = __md5gg(b, c, d, a, x[i+ 4], 20, -405537848);
        a = __md5gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
        d = __md5gg(d, a, b, c, x[i+14], 9 , -1019803690);
        c = __md5gg(c, d, a, b, x[i+ 3], 14, -187363961);
        b = __md5gg(b, c, d, a, x[i+ 8], 20,  1163531501);
        a = __md5gg(a, b, c, d, x[i+13], 5 , -1444681467);
        d = __md5gg(d, a, b, c, x[i+ 2], 9 , -51403784);
        c = __md5gg(c, d, a, b, x[i+ 7], 14,  1735328473);
        b = __md5gg(b, c, d, a, x[i+12], 20, -1926607734);
        a = __md5hh(a, b, c, d, x[i+ 5], 4 , -378558);
        d = __md5hh(d, a, b, c, x[i+ 8], 11, -2022574463);
        c = __md5hh(c, d, a, b, x[i+11], 16,  1839030562);
        b = __md5hh(b, c, d, a, x[i+14], 23, -35309556);
        a = __md5hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
        d = __md5hh(d, a, b, c, x[i+ 4], 11,  1272893353);
        c = __md5hh(c, d, a, b, x[i+ 7], 16, -155497632);
        b = __md5hh(b, c, d, a, x[i+10], 23, -1094730640);
        a = __md5hh(a, b, c, d, x[i+13], 4 ,  681279174);
        d = __md5hh(d, a, b, c, x[i+ 0], 11, -358537222);
        c = __md5hh(c, d, a, b, x[i+ 3], 16, -722521979);
        b = __md5hh(b, c, d, a, x[i+ 6], 23,  76029189);
        a = __md5hh(a, b, c, d, x[i+ 9], 4 , -640364487);
        d = __md5hh(d, a, b, c, x[i+12], 11, -421815835);
        c = __md5hh(c, d, a, b, x[i+15], 16,  530742520);
        b = __md5hh(b, c, d, a, x[i+ 2], 23, -995338651);
        a = __md5ii(a, b, c, d, x[i+ 0], 6 , -198630844);
        d = __md5ii(d, a, b, c, x[i+ 7], 10,  1126891415);
        c = __md5ii(c, d, a, b, x[i+14], 15, -1416354905);
        b = __md5ii(b, c, d, a, x[i+ 5], 21, -57434055);
        a = __md5ii(a, b, c, d, x[i+12], 6 ,  1700485571);
        d = __md5ii(d, a, b, c, x[i+ 3], 10, -1894986606);
        c = __md5ii(c, d, a, b, x[i+10], 15, -1051523);
        b = __md5ii(b, c, d, a, x[i+ 1], 21, -2054922799);
        a = __md5ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
        d = __md5ii(d, a, b, c, x[i+15], 10, -30611744);
        c = __md5ii(c, d, a, b, x[i+ 6], 15, -1560198380);
        b = __md5ii(b, c, d, a, x[i+13], 21,  1309151649);
        a = __md5ii(a, b, c, d, x[i+ 4], 6 , -145523070);
        d = __md5ii(d, a, b, c, x[i+11], 10, -1120210379);
        c = __md5ii(c, d, a, b, x[i+ 2], 15,  718787259);
        b = __md5ii(b, c, d, a, x[i+ 9], 21, -343485551);
        a = __add(a, _oa);
        b = __add(b, _ob);
        c = __add(c, _oc);
        d = __add(d, _od);
    }
    return [a, b, c, d];
  };


  return function(data) {
    return __bin2hex(__data2md5(__str2bin(data, true), data.length*__chrsz), true);
  };
})();