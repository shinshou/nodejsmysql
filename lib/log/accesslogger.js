const log4js = require("log4js");
const logger = require("./logger").access;
const DEFAULT_LOG_LEVEL = "auto";

module.exports = function (options) {
  //optionsの指定がなかったときの対策
  options = options || {};
  //ログレベルの指定
  options.level = options.level || DEFAULT_LOG_LEVEL;
  options.format = options.format || function (req, res, format) {
    let address = req.headers["x-forwarded-for"] || req.ip;
    address = address.replace(/(\.|:)\d+(,|$)/g, "$10$2");

    return format(
      `${address}` +
      ":method" +
      ":url" +
      "HTTP/:http-version" +
      ":status" +
      ":response-time" +
      ":user-agent"
    );
  };
  return log4js.connectLogger(logger, options);
};