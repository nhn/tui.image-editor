'use strict';
var path = require('path');
var gulp = require('gulp');
var browserify = require('browserify');
var browserSync = require('browser-sync').create();
var KarmaServer = require('karma').Server;
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var header = require('gulp-header');

var pkg = require('./package.json');
var filename = pkg.name.replace('tui-', '');
var banner = ['/**',
    ' * <%= pkg.name %>',
    ' * @author <%= pkg.author %>',
    ' * @version v<%= pkg.version %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');


//
// Constants
//
var SOURCE_DIR = './src/**/*',
    ENTRY = 'index.js',
    DIST = './dist',
    SAMPLE_DIST = './samples/js';

//
// Configurations
//
var config = {
    browserify: {
        entries: ENTRY
    },
    browserSync: {
        server: {
            index: './basic.html',
            baseDir: './samples'
        },
        port: 3000,
        ui: {
            port: 3001
        }
    },
    browserSyncStream: {
        once: true
    }
};
config.watchify = Object.assign({}, watchify.args, config.browserify);

//
// Bundle function
//
function bundle(bundler) {
    return bundler.bundle()
        .on('error', function(err) {
            console.log(err.message);
            browserSync.notify('Browserify Error!');
            this.emit('end');
        })
        .pipe(source(filename + '.js'))
        .pipe(buffer())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest(DIST))
        .pipe(gulp.dest(SAMPLE_DIST))
        .pipe(
            gulpif(
                browserSync.active,
                browserSync.stream(config.browserSyncStream)
            )
        );
}

//
// Development
//
gulp.task('watch', function() {
    var bundler = watchify(browserify(config.watchify));

    browserSync.init(config.browserSync);
    bundler.on('update', function() {
        bundle(this);
    });
    bundler.on('log', gutil.log);
    bundle(bundler);
});

gulp.task('connect', function() {
    connect.server();
    gulp.watch(SOURCE_DIR, ['liveBundle']);
});

gulp.task('liveBundle', function() {
    return bundle(browserify(config.browserify));
});

//
// Build
//
gulp.task('karma', ['eslint'], function(done) {
    new KarmaServer({
        configFile: path.join(__dirname, 'karma.conf.js'),
        singleRun: true,
        logLevel: 'error'
    }, done).start();
});

gulp.task('eslint', function() {
    return gulp.src(['./src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});


gulp.task('bundle', ['karma'], function() {
    return bundle(browserify(config.browserify));
});

gulp.task('compress', ['bundle'], function() {
    gulp.src(filename + '.js')
        .pipe(uglify())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(concat(filename + '.min.js'))
        .pipe(gulp.dest(DIST));
});

//
// DefaultCommand
//
gulp.task('default', ['eslint', 'karma', 'bundle', 'compress']);
