var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');

gulp.task('js', function() {
    return gulp.src([
        'node_modules/vis/dist/vis.js',
        'src/app.js'
    ])
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
    return gulp.src([
        'node_modules/vis/dist/vis.css',
        'src/style.css'
    ])
        .pipe(concat('style.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['js', 'css']);
