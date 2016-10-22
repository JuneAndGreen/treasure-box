'use strict';

const gulp = require('gulp');
const less = require('gulp-less');

gulp.task('less', function() {
  gulp.watch('./webapp/src/less/*.less', function(event) {
    gulp.src('./webapp/src/less/!(_)*.less')
        .pipe(less())
        .pipe(gulp.dest('./webapp/src/css/'));
  });
});

gulp.task('default', function() {
	gulp.run('less');
});
