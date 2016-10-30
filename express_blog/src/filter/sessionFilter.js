var express = require('express');

var router = express.Router();

function noSessionCheck(req, res, next) {
  if(!req.session.username) {
    return res.redirect('/login');
  }

  next();
}
router.get('/', noSessionCheck);
router.get('/blog/:id', noSessionCheck);
router.get('/add', noSessionCheck);
router.get('/edit/:id', noSessionCheck);


function hasSessionCheck(req, res, next) {
  if(req.session.username) {
    return res.redirect('/');
  }

  next();
}
router.get('/login', hasSessionCheck);

module.exports = router;