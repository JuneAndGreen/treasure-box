'use strict';

module.exports = {
    'GET /api/blog/:id': 'blog.findOne',
    'PATCH /api/blog/:id': 'blog.update',
    'DELETE /api/blog/:id': 'blog.remove',

    'GET /api/blog': 'blog.findList',
    'POST /api/blog': 'blog.create',

    'GET /': 'user.indexPage',
    'GET /login': 'user.loginPage',

    'POST /api/login': 'user.login',
    'POST /api/register': 'user.register',
    'GET /api/logout': 'user.logout',
};
