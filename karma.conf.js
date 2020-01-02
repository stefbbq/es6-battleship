module.exports = function(config) {
  config.set({
    basePath: "",
    frameworks: ["browserify", "jasmine"],
    files: ["spec/**"],
    preprocessors: {
      "spec/**/*.js": ["browserify"],
      "src/**/*.js": ["coverage"],
    },
    browserify: {
      debug: true,
      transform: [
        [
          "babelify",
          {
            presets: ["es2015"],
          },
        ],
      ],
    },
    coverageReporter: {
      type: "html",
      dir: "coverage/",
    },
    reporters: ["spec"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    singleRun: false,
    concurrency: Infinity,
    browserDisconnectTolerance: 2,
  });
};
