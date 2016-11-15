// app.js

var express = require('express');

var app = express();

// router
app.use('/', function(req, res, next) {
    res.end('hello world!');
});

// app start
app.listen(8088);
console.log('listening on port: 8088');