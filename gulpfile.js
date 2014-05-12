var gulp = require('gulp');
var concat = require('gulp-concat');
var handlebars = require('gulp-ember-handlebars');

gulp.task('templates', function(){
  gulp.src(['public/js/admintemplates/*.handlebars'])
    .pipe(handlebars({
      outputType: 'browser'
     }))
    .pipe(concat('admin.templates.js'))
    .pipe(gulp.dest('public/js/'));
});


gulp.task('default', function() {
    gulp.start('templates');
});