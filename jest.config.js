const fs = require('fs')

if (!fs.existsSync("./test/output"))
  fs.mkdirSync("./test/output")

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  reporters: [
    "default",
    ["./node_modules/jest-html-reporter", {
      "pageTitle": "Test Report"
    }]
  ]
};
