var blogService = require('../service/blogService');
var _ = require('../util/api');

module.exports = {
  /**
   * 增
   */
  add: function(req, res, next) {
    // 校验参数
    var ret = _.validate(req.body, {
      title: {required: true},
      content: {required: true}
    });

    if(!ret.success) {
      return res.send(_.resPkg('PARAMERR'));
    }

    // 补充创建者
    ret.data.username = req.session.username;

    blogService.add(ret.data, function(err, blog) {
      if(err) {
        return res.send(_.resPkg('PARAMERR'));
      }

      res.send(_.resPkg('SUCCESS', blog));
    });
  },
  /**
   * 改
   */
  update: function(req, res, next) {
    // 校验参数
    var ret = _.validate(req.body, {
      id: {required: true},
      title: {required: true},
      content: {required: true}
    });

    if(!ret.success) {
      return res.send(_.resPkg('PARAMERR'));
    }

    blogService.update(ret.data, function(err, blog) {
      if(err) {
        console.log(err.stack);
        return res.send(_.resPkg('PARAMERR'));
      }

      res.send(_.resPkg('SUCCESS', blog));
    });
  },
  /**
   * 删
   */
  del: function(req, res, next) {
    // 校验参数
    var ret = _.validate(req.query, {
      id: {required: true, isNumber: true}
    });

    if(!ret.success) {
      return res.send(_.resPkg('PARAMERR'));
    }

    ret.data.username = req.session.username;
    blogService.del(ret.data, function(err) {
      if(err) {
        return res.send(_.resPkg('PARAMERR'));
      }

      res.redirect('/');
    });
  },
  /**
   * 首页
   */
  indexPage: function(req, res, next) {
    blogService.findAll(function(err, blogs) {
      if(err) {
        return res.render('error');
      }

      res.render('index', {
        blogs: blogs,
        username: req.session.username
      });
    });
  },
  /**
   * 修改页
   */
  editPage: function(req, res, next) {
    var id = req.params.id;

    blogService.findOne(id, function(err, blog) {
      if(err) {
        return res.render('error');
      }

      blog.content = blog.content.replace(/\'/g, '\\\'');
      res.render('edit', {
        blog: blog
      });
    });
  },
  /**
   * 增加页
   */
  addPage: function(req, res, next) {
    res.render('edit', {
      blog: {}
    });
  },
  /**
   * 详情页
   */
  detailPage: function(req, res, next) {
    var id = req.params.id;

    blogService.findOne(id, function(err, blog) {
      if(err) {
        return res.render('error');
      }

      res.render('blog', {
        blog: blog
      });
    });
  }
};