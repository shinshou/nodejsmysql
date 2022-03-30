const log4js = require("log4js");
const config = require("../../config/log4js.config.js");
let console;
let application;
let access;

log4js.configure(config);

//console logger
console = log4js.getLogger();

//Application logger
application = log4js.getLogger("application");

//Access logger
access = log4js.getLogger("access");

module.exports = {
  console,
  application,
  access
};