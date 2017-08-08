'use strict';

const gulp = require('gulp');
const less = require('gulp-less');

gulp.task('less', () => {
    gulp.src('./webapp/src/less/!(_)*.less')
        .pipe(less())
        .pipe(gulp.dest('./webapp/src/css'));
})

gulp.task('watch', () => {
    gulp.watch('./webapp/src/less/*.less', ['less']);
});

gulp.task('default', ['less', 'watch']);
