var gulp = require('gulp'),
    browserify = require('browserify'),
    gulp_browserify = require('gulp-browserify'),
    watchify = require('watchify'),
    size = require('gulp-size'),
    clean = require('gulp-clean'),
    compileCSS = require('gulp-sass'),
    minifyJS = require('gulp-uglify'),
    minifyCSS = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    replaceExtension = require('gulp-ext-replace'),
    shell = require('gulp-shell'),
    tap = require('gulp-tap'),
    source = require('vinyl-source-stream');
    SOURCE_DIR = './static/src';
    BUILD_DIR = './static/build';

gulp.task('default', ['watch_tasks']);

gulp.task('build', ['build_vendor', 'build_scripts', 'build_styles']);

gulp.task('watch_scripts', ['clean_scripts'], function () {
    return gulp.src(source_dir + '/scripts/*')
        .pipe(tap(function(file) {
            var bundler = browserify({
                entries: [file.path],
                cache: {},
                packagecache: {},
                debug: true,
                fullpaths: true,
                plugin: [watchify],
                transform: ['reactify']
            });
            bundler.on('update', function() {
                var file_name = file.path.replace(/^.*[\\\/]/, '');
                bundler.bundle()
                    .pipe(source(file_name))
                    .pipe(gulp.dest(build_dir + '/js/'));
                console.log(file_name + ' rebundled...');
            });
            file.contents = bundler.bundle();
        }))
        .pipe(gulp.dest(build_dir + '/js/'));
});

gulp.task('watch_styles', ['clean_styles'], function () {
    return gulp.src(source_dir + '/styles/*.scss')
        .pipe(compilecss().on('error', compilecss.logerror))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
         }))
        .pipe(replaceextension('.css'))
        .pipe(gulp.dest(build_dir + '/css/'));
});

gulp.task('build_scripts', ['clean_scripts'], function () {
    return gulp.src(source_dir + '/scripts/*')
        .pipe(gulp_browserify({transform: ['reactify']}))
        .pipe(minifyjs())
        .pipe(gulp.dest(build_dir + '/js/'))
        .pipe(size());
});

gulp.task('build_styles', ['clean_styles'], function () {
    return gulp.src(source_dir + '/styles/*.scss')
        .pipe(compilecss().on('error', compilecss.logerror))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
         }))
        .pipe(minifycss())
        .pipe(replaceextension('.css'))
        .pipe(gulp.dest(build_dir + '/css/'))
        .pipe(size());
});


gulp.task('clean_styles', function() {
    return gulp.src([BUILD_DIR + '/css/'], {read: false})
        .pipe(clean());
});

gulp.task('clean_scripts', function() {
    return gulp.src([BUILD_DIR + '/js/'], {read: false})
        .pipe(clean());
});

gulp.task('clean_vendor', function() {
    return gulp.src([BUILD_DIR + '/node_modules/'], {read: false})
        .pipe(clean());
});

gulp.task('watch_tasks', ['watch_scripts', 'watch_styles'], function() {
    gulp.watch(SOURCE_DIR + '/styles/*', ['watch_styles']);
});
