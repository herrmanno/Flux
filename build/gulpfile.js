var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var wrap = require('gulp-wrap');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var paths = {
    js: ['promise', 'config', 'err', 'ajax', 'util', 'action', 'dispatcher', 'store', 'stores', 'state', 'main']
        .map(function(f) {return '../src/'+f+'.js';}),
};

gulp.task('clean', function (cb) {
  del(['./dist/flux.js', './dist/flux.min.js'], cb);
});

gulp.task('bundle', ['clean'], function() {
	return gulp.src(paths.js)
		.pipe(concat('flux.js'))
		.pipe(wrap({ src: 'wrap.js'}))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('bundle-min', ['bundle'], function() {
	return gulp.src('./dist/flux.js')
		.pipe(uglify())
		.pipe(rename('flux.min.js'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['bundle-min']);
});

gulp.task('default', ['watch', 'bundle', 'bundle-min'], function() {
	return void 0;
});
