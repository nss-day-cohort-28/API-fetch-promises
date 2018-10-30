module.exports = {
  scripts: {
    files: [
      "../scripts/**/*.js",
      "!node_modules/**/*.js"
    ],
    tasks: ["eslint"],
    options: {
      spawn: false,
      debounceDelay: 1000
    }
  }
}
