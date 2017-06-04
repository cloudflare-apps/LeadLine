var gulp = require('gulp');
var transpile  = require('gulp-es6-module-transpiler');

gulp.task('default', ['build'], function() {
  return gulp.watch('lead-line.js', ['build']);
});

gulp.task('build', function() {
  return gulp.src('lead-line.js')
    .pipe(transpile({
      formatter: 'bundle',
      importPaths: ['.', './bower_components']
    }))
    .pipe(gulp.dest('build/'));
})
