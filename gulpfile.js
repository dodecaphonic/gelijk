const gulp = require("gulp");
const mocha = require("gulp-mocha");

gulp.task("build", () => (
  gulp.src("src/**/*.js")
    .pipe(gulp.dest("dist"))
));

gulp.task("default", ["build"]);

gulp.task("test", () => (
  gulp.src("test/**/*.js")
    .pipe(mocha({
      timeout: 15000
    }))
));

gulp.task("watch-test", () => (
  gulp.watch(["src/**/*.js", "test/**/*.js"], ["test"])
));
