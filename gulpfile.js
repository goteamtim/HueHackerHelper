var gulp = require('./node_modules/gulp');
var jsmin = require('gulp-jsmin');
var rename = require('gulp-rename');
 
gulp.task('default', function () {
    
});

gulp.task('test',function(){
    console.log("Testing working.")
})

gulp.task('deploy', function(){
    gulp.src('js/popup.js')
        .pipe(jsmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist'));
})