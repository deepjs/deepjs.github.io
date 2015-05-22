// npm i --save-dev gulp gulp-rename gulp-jshint jshint-stylish gulp-live-server gulp-sass
var gulp = require('gulp'),
    gls = require('gulp-live-server'),
    rename = require("gulp-rename");
//___________________________________________________

gulp.task('default', ['lint']);
gulp.task('lint', ['jslint']);

//___________________________________________________
var jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish');

gulp.task('jslint', function() {
    gulp.src('js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});
//___________________________________________________
gulp.task('serve', function() {
    var server = gls.static(".", 8287);
    server.start();
    //live reload changed resource(s) 
    gulp.watch(['index.html', 'js/**/*.js', 'css/**/*.css'], server.notify);
});
//___________________________________________________
var sass = require('gulp-sass');
gulp.task('sass', function() {
    gulp.src('./sass/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});

gulp.task('sass:watch', function() {
    gulp.watch('./sass/**/*.scss', ['sass']);
});
