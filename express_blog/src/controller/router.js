var express = require('express');

var blogController = require('./blogController');
var userController = require('./userController');

var router = express.Router();

router.get('/login', userController.loginPage);
router.get('/logout', userController.logout);
router.post('/api/login', userController.login);
router.post('/api/register', userController.register);

router.get('/', blogController.indexPage);
router.get('/blog/:id', blogController.detailPage);
router.get('/add', blogController.addPage);
router.get('/edit/:id', blogController.editPage);
router.get('/api/del', blogController.del);
router.post('/api/add', blogController.add);
router.post('/api/update', blogController.update);

module.exports = router;