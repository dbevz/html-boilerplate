'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify'),
    postcss = require('gulp-postcss'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    sourcemaps = require('gulp-sourcemaps'),
    cssnext = require('postcss-cssnext'),
    cssnano = require('cssnano'),
    nested = require('postcss-nested'),
    stylelint = require('stylelint'),
    reporter = require('postcss-browser-reporter'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

var path = {
  dist: { // Тут мы укажем куда складывать готовые после сборки файлы
    html: 'dist/',
    js: 'dist/js/',
    css: 'dist/css/',
    img: 'dist/img/',
    fonts: 'dist/fonts/',
    sprite: 'dist/img/'
  },
  src: { // Пути откуда брать исходники
    html: 'src/index.html', // Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
    js: 'src/js/index.js', // В стилях и скриптах нам понадобятся только main файлы
    style: 'src/styles/main.css',
    img: 'src/img/*.*', // Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
    fonts: 'src/fonts/**/*.*',
    assets: 'src/assets/'
  },
  watch: { // Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    html: 'src/**/*.html',
    js: 'src/js/*.js',
    style: 'src/styles/*.css',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*',
  },
  clean: './dist/img/'
};

var config = {
  server: {
      baseDir: "./dist"
  },
  tunnel: true,
  host: 'localhost',
  port: 9000,
  logPrefix: "dbevz"
};

gulp.task('html:build', function () {
  gulp.src(path.src.html) // Выберем файлы по нужному пути
      .pipe(rigger()) // Прогоним через rigger
      .pipe(gulp.dest(path.dist.html)) // Выплюнем их в папку build
      .pipe(reload({stream: true})); // И перезагрузим наш сервер для обновлений
});

gulp.task('js:build', function () {
  gulp.src(path.src.js) // Найдем наш main файл
      .pipe(rigger()) // Прогоним через rigger
      .pipe(sourcemaps.init()) // Инициализируем sourcemap
      .pipe(uglify()) // Сожмем наш js
      .pipe(sourcemaps.write()) // Пропишем карты
      .pipe(gulp.dest(path.dist.js)) // Выплюнем готовый файл в build
      .pipe(reload({stream: true})); 
});

gulp.task('style:build', function () {

  var pocessors = [stylelint('.stylelintrc'), reporter, nested, cssnext, cssnano];


  gulp.src(path.src.style)
      .pipe( sourcemaps.init() )
      .pipe( rigger() ) 
      .pipe( postcss( pocessors ) )
      .pipe( sourcemaps.write('.') )
      .pipe( gulp.dest(path.dist.css) )
      .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
  gulp.src(path.src.img) // Выберем наши картинки
      .pipe(imagemin({ // Сожмем их
          progressive: true,
          svgoPlugins: [{removeViewBox: false}],
          use: [pngquant()],
          interlaced: true
      }))
      .pipe(gulp.dest(path.dist.img)) // И бросим в build
      .pipe(reload({stream: true})); 
});

gulp.task('fonts:build', function() {
  gulp.src(path.src.fonts)
      .pipe(gulp.dest(path.dist.fonts))
      .pipe(reload({stream: true}));
});

gulp.task('watch', function(){
  watch([path.watch.html], function(event, cb) {
      gulp.start('html:build');
  });
  watch([path.watch.style], function(event, cb) {
      gulp.start('style:build');
  });
  watch([path.watch.js], function(event, cb) {
      gulp.start('js:build');
  });
  watch([path.watch.img], function(event, cb) {
      gulp.start('image:build');
  });
  watch([path.watch.fonts], function(event, cb) {
      gulp.start('fonts:build');
  });
});

gulp.task('webserver', function () {
  browserSync(config);
});

gulp.task('clean', function (cb) {
  rimraf(path.clean, cb);
});

gulp.task('default', ['html:build', 'style:build', 'js:build', 'fonts:build', 'image:build', 'webserver', 'watch']);