'use strict'

module.exports = {
  '/api/:service/:id': {
  	all: function*(next) {
  	  let id = parseInt(this.params.id, 10);
      this.__id = id;

      if(isNaN(id)) {
        // id不合法
        throw 'BAD_REQUEST';
      }
      yield next;
  	}
  },

  '/api/(?!login|register)': {
    isRegex: true,
    all: function*(next) {
      console.log('sssss'),
      yield next;
    }
  }
};
