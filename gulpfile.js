var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var wrap = require('gulp-wrap');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var src = ['config', 'err', 'ajax', 'util', 'action', 'dispatcher', 'store', 'stores', 'state', 'main'].map(function(f) {return './src/'+f+'.js';});
src.unshift('./bower_components/ho-promise/promise.js');

var bundle = 'flux.js';
var bundlemin = bundle.substr(0, bundle.length-2)+'min.js';

var dest = './';
var delFiles = [bundle, bundlemin].map(function(f) {return dest+f;});

gulp.task('clean', function (cb) {
  del(delFiles, cb);
});

gulp.task('bundle', ['clean'], function() {
	return gulp.src(src)
		.pipe(concat(bundle))
		.pipe(wrap({ src: 'wrap.js'}))
		.pipe(gulp.dest(dest));
});

gulp.task('bundle-min', ['bundle'], function() {
	return gulp.src(bundle)
		.pipe(uglify())
		.pipe(rename(bundlemin))
		.pipe(gulp.dest(dest));
});

gulp.task('watch', function() {
  gulp.watch(src, ['bundle-min']);
});

gulp.task('default', ['watch', 'bundle', 'bundle-min'], function() {
	return void 0;
});
