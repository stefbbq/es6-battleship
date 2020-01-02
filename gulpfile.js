const browserify = require("browserify");
const browserSync = require("browser-sync").create();
const buffer = require("vinyl-buffer");
const gulp = require("gulp");
const source = require("vinyl-source-stream");

// Tasks

gulp.task("serve", function() {
  browserSync.init({
    server: "build",
  });
});

gulp.task("build", function() {
  return browserify({ entries: "./src/index.js", debug: true })
    .transform("babelify", { presets: ["es2015"] })
    .bundle()
    .pipe(source("index.js"))
    .pipe(buffer())
    .pipe(gulp.dest("./build"));
});

gulp.task("watch-js", ["build"], function(done) {
  browserSync.reload();
  done();
});

gulp.task("watch", ["serve"], function() {
  gulp.watch("src/**/*.js", ["watch-js"]);
});
