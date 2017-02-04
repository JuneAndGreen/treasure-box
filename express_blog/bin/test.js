var Mocha = require('mocha');
var path = require('path');
var fs = require('fs');

var mocha = new Mocha();
var dir = path.join(__dirname, '../test/service/');

mocha.addFile(dir + 'blogServiceTestCase.js');
mocha.addFile(dir + 'userServiceTestCase.js');

mocha.run(function(err) {
  process.on('exit', function() {
    process.exit(err);
  });
});