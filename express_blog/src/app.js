var path = require('path');

var express = require('express');
var ejs = require('ejs');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var filter = require('./filter/sessionFilter');
var router = require('./controller/router');

var app = express();

// static path
app.use(express.static(path.join(__dirname, '../webapp/')));

// view engine
app.set('views', path.join(__dirname, './views/'));
app.set('view engine', 'ejs');
app.engine('ejs', ejs.renderFile);

// cookie
app.use(cookieParser());

// session
app.use(session({
  secret: 'express_blog_demo',
  cookie: {maxAge: 30*60*1000},
  resave: false,
  saveUninitialized: true,
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// filter
app.use('/', filter);

// router
app.use('/', router);

// app start
app.listen(8088);
console.log('listening on port: 8088');