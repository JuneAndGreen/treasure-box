'use strict';

const BaseService = require('./baseService');
const BlogDao = require('../dao/blogDao');
const CommentDao = require('../dao/commentDao');
const ShareDao = require('../dao/shareDao');

const commentDao = new CommentDao();
const shareDao = new ShareDao();

module.exports = class BlogService extends BaseService {
    constructor() {
        super(new BlogDao());
    }

    *add(obj, userId, ctx) {
    	obj.type = obj.type || '未分类';
    	obj.userId = userId;

    	return yield super.add(obj, userId, ctx);
    }

    *find(condition, userId, ctx) {    
	    let reses = yield this.dao.find(condition);
	    let ids = reses.map((item) => {return item.id});

	    let cmap = yield commentDao.getCount(ids);
	    let smap = yield shareDao.getCount(ids);

	    reses.forEach((res) => {
	    	res.commentNum = cmap[res.id] || 0;
	    	res.shareNum = smap[res.id] || 0;
	    });

	    return reses;
	  }

	  *search(query, userId, ctx) {
	  	query = query || '';
	    let reses = yield this.dao.search(query);
	    let ids = reses.map((item) => {return item.id});

	    let cmap = yield commentDao.getCount(ids);
	    let smap = yield shareDao.getCount(ids);

	    reses.forEach((res) => {
	    	res.commentNum = cmap[res.id] || 0;
	    	res.shareNum = smap[res.id] || 0;
	    });

	    return reses;
	  }
};
