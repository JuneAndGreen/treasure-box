var assert = require('assert');
var should = require('should');

var blogService = require('../../src/service/blogService');

// 生成博客数据
function getBlogData() {
  return {
    title: 'auto-' + (+new Date()),
    username: 'admin',
    content: 'auto-content-' + (+new Date())
  };
}

// 获取博客的数据库字段
function getBlogProperties() {
  return ['id', 'title', 'username', 'content', 'create_time'];
}

describe('blogService module', function() {

  describe('add', function() {
    it('创建一篇博客', function(done) {
      blogService.add(getBlogData(), function(err, ret) {
        if(err) {
          done(err);
        } else {
          ret.should.have.properties(getBlogProperties());
          done();
        }
      });
    });
  });

  describe('update', function() {
    it('更新一篇博客', function(done) {
      blogService.add(getBlogData(), function(err, ret) {
        if(err) {
          done(err);
        } else {
          ret.should.have.properties(getBlogProperties());

          blogService.update({id: ret.id, title: ret.title, content: 'xxx'}, function(err, ret) {
            if(err) {
              done(err);
            } else {
              ret.should.have.properties(getBlogProperties());
              ret.content.should.be.eql('xxx');
              done();
            }
          });
        }
      });
    });
  });

  describe('del', function() {
    it('删除一篇博客', function(done) {
      blogService.add(getBlogData(), function(err, ret) {
        if(err) {
          done(err);
        } else {
          ret.should.have.properties(getBlogProperties());

          blogService.del({id: ret.id, username: 'admin'}, function(err, ret) {
            if(err) {
              done(err);
            } else {
              done();
            }
          });
        }
      });
    });
  });

  describe('findAll', function() {
    it('查找所有博客', function(done) {
      blogService.findAll(function(err, ret) {
        if(err) {
          done(err);
        } else {
          ret.should.be.an.Array();
          ret.should.matchEach(function(it) {
            it.should.have.properties(getBlogProperties());
          });
          done();
        }
      });
    });
  });

  describe('findOne', function() {
    it('查找某篇博客详情', function(done) {
      blogService.add(getBlogData(), function(err, ret) {
        if(err) {
          done(err);
        } else {
          ret.should.have.properties(getBlogProperties());
          var id = ret.id;

          blogService.findOne(id, function(err, ret) {
            if(err) {
              done(err);
            } else {
              ret.should.have.properties(getBlogProperties());
              ret.id.should.be.eql(id);
              done();
            }
          });
        }
      });
    });
  });

});