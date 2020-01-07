// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
// Initialize modules
const { src, dest, watch, series, parallel } = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const plumber = require("gulp-plumber");
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const imagemin = require('gulp-imagemin');
const cssnano = require('cssnano');
const del = require('del');
var replace = require('gulp-replace');

// File paths
const files = {
    scssPath: 'assets/scss/**/*.scss',
    jsPath: 'assets/js/*.js',
    vendorJS: 'assets/js/vendor/*.js',
    images: 'assets/images/*.!(db)',
    fonts: 'assets/fonts/*.{ttf,woff,eof,svg,otf,woff2}',
}

// For reload public 
function delTask() {
    return del(["public/js", "public/css","public/images"]);
}

// For css
function scssTask() {
    return src(files.scssPath)
        .pipe(sourcemaps.init()) 
        .pipe(plumber())  // For Error Handler And Automatic Gulp Restart
        .pipe(sass()) 
        .pipe(postcss([autoprefixer(), cssnano()])) 
        .pipe(sourcemaps.write('.')) // For Mapping path 
        .pipe(dest('public/css') // Define Destination
        ); 
}

// For Js
function jsTask() {
    return src([
        files.jsPath
    ])
    .pipe(plumber())
    .pipe(concat('main.js')) 
        .pipe(uglify()) // For minify
        .pipe(dest('public/js')
        );
}

// For vendor Js
function vendorjsTask() {
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/jquery-migrate/dist/jquery-migrate.min.js',
        files.vendorJS,
    ])
    .pipe(plumber())
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(dest('public/js')
        );
}

// For Fonts
function fontTask() {
    return src([
        files.fonts
    ])
    .pipe(plumber())
    .pipe(dest('public/fonts')
    );
}

// For Images
function imageTask() {
    return src([
        files.images
    ])
    .pipe(plumber())
    .pipe(imagemin()) // For Optimization
    .pipe(dest('public/images')
    );
}
// Watch SCSS and JS files for changes
function watchTask() {
    watch([files.scssPath, files.jsPath, files.vendorJS,files.fonts,files.images],
        series(
            delTask,
            vendorjsTask,
            fontTask,
            imageTask,
            parallel(scssTask, jsTask)
        )
    );
}

// Export the default Gulp task so it can be run
exports.default = series(
    delTask,
    vendorjsTask,
    fontTask,
    imageTask,
    parallel(scssTask, jsTask),
    watchTask
);