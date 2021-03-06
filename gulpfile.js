var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var cp = require('child_process');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var notify = require('gulp-notify');
var cssmin = require('gulp-cssmin');
var plumber = require('gulp-plumber');

var jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function(done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn(jekyll, ['build'], {
            studio: 'inherit'
        })
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function() {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */

gulp.task('serveIt', ['sass', 'scripts', 'jekyll-build'], function() {

    browserSync.init({
        server: {
            baseDir: '_site'
        },
        open: false
    });

    gulp.watch('_scss/**/*.scss', ['sass']);
    gulp.watch('_js/*.js', ['scripts']).on('change', browserSync.reload);
    gulp.watch(['*.html', '_includes/**/*.html', '_data/*.yml', '_layouts/*.html', '*.md', '_posts/**/*'], ['jekyll-rebuild']);
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function() {
    return gulp.src('_scss/main.scss', {
            style: 'expanded'
        })
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['> 5%', 'last 2 versions', 'Firefox ESR', 'Safari >= 6', 'Opera 12.1'],
            cascade: false
        }))
        .pipe(gulp.dest('css'))
        .pipe(gulp.dest('_site/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cssmin())
        .pipe(gulp.dest('css'))
        .pipe(gulp.dest('_site/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(notify({
            message: 'Styles task complete'
        }));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src('_js/*.js')
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('js'))
        .pipe(gulp.dest('_site/js'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest('js'))
        .pipe(gulp.dest('_site/js'))
        .pipe(notify({
            message: 'Scripts task complete'
        }));
});

gulp.task('default', ['serveIt']);