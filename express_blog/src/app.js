var path = require('path');

var express = require('express');
var ejs = require('ejs');

var app = express();

// static path
app.use(express.static(path.join(__dirname, '../webapp/')));

// view engine
app.set('views', path.join(__dirname, './views/'));
app.set('view engine', 'ejs');
app.engine('ejs', ejs.renderFile);

// router
app.get('/login', function(req, res, next) {
	res.render('login');
});

app.get('/', function(req, res, next) {
	res.render('index');
});

app.get('/blog/:id', function(req, res, next) {
	res.render('blog');
});

app.get('/add', function(req, res, next) {
	res.render('edit');
});
app.get('/edit/:id', function(req, res, next) {
	res.render('edit');
});

// app start
app.listen(8088);