var gulp = require('./node_modules/gulp');
var jsmin = require('gulp-jsmin');
var rename = require('gulp-rename');
var del = require('del');
var vinylPaths = require('vinyl-paths');
const zip = require('gulp-zip');
 
gulp.task('default', () =>
    gulp.src('src/*')
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('dist'))
);
 
gulp.task('default', function () {
    
});

gulp.task('test',function(){
    console.log("Testing working.")
})

gulp.task('deploy', function(){
    gulp.src('dist/*')
    .pipe(vinylPaths(del));

    gulp.src('js/popup.js')
        .pipe(jsmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist'));

    gulp.src('manifest.json')
        .pipe(gulp.dest('dist'));
})